import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { tremendous } from "@/lib/tremendous/client";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();

  // Find pending deliveries
  const { data: deliveries } = await supabase
    .from("deliveries")
    .select(
      `
      *,
      pools(*, teachers(name, email), schools(name))
    `
    )
    .eq("status", "pending")
    .lt("retry_count", 3);

  if (!deliveries || deliveries.length === 0) {
    return NextResponse.json({ delivered: 0 });
  }

  let delivered = 0;

  for (const delivery of deliveries) {
    const pool = delivery.pools as {
      classroom_name: string;
      occasion: string;
      message: string | null;
      teacher_email: string | null;
      teachers: { name: string; email: string | null } | null;
      schools: { name: string } | null;
    } | null;

    if (!pool) continue;

    const teacherEmail = pool.teacher_email || pool.teachers?.email;
    if (!teacherEmail) {
      await supabase
        .from("deliveries")
        .update({
          status: "failed",
          last_error: "No teacher email available",
        })
        .eq("id", delivery.id);
      continue;
    }

    try {
      // Mark as processing
      await supabase
        .from("deliveries")
        .update({ status: "processing" })
        .eq("id", delivery.id);

      // 1. Purchase gift card via Tremendous
      const amountDollars = (delivery.gift_card_amount_cents || 0) / 100;
      const giftCardResult = await tremendous.purchaseGiftCard(
        amountDollars,
        delivery.gift_card_brand || "amazon"
      );
      const redemptionUrl = giftCardResult.order.rewards?.[0]?.delivery?.link;
      const orderId = giftCardResult.order.id;

      // 2. Get child names for the card
      const { data: contributions } = await supabase
        .from("contributions")
        .select("child_name")
        .eq("pool_id", delivery.pool_id)
        .eq("status", "completed");

      const childNames = (contributions || []).map(
        (c) => c.child_name || `A Family in ${pool.classroom_name}`
      );

      // 3. Send email to teacher
      const claimUrl = `${process.env.NEXT_PUBLIC_APP_URL}/claim/${delivery.id}?token=${delivery.teacher_claim_token}`;

      await getResend().emails.send({
        from: `Appleseed <${process.env.RESEND_FROM_EMAIL || "gifts@appleseed.com"}>`,
        to: teacherEmail,
        subject: `You have a gift from ${pool.classroom_name}! 🍎`,
        html: `
          <div style="font-family: 'DM Sans', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #faf8f4;">
            <h1 style="font-family: Georgia, serif; color: #3d6b3d; font-size: 24px;">
              A gift for you, ${pool.teachers?.name}!
            </h1>
            <p style="color: #7a7060;">
              The families of ${pool.classroom_name} at ${pool.schools?.name}
              have come together to show their appreciation for ${pool.occasion}.
            </p>
            <p style="color: #7a7060;">
              <strong>${childNames.length} families</strong> contributed to this gift.
            </p>
            ${pool.message ? `<p style="color: #2d2a26; font-style: italic;">"${pool.message}"</p>` : ""}
            <div style="text-align: center; margin: 24px 0;">
              <a href="${claimUrl}"
                 style="display: inline-block; padding: 14px 32px; background: #3d6b3d; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Claim Your Gift
              </a>
            </div>
            <p style="color: #a09880; font-size: 12px; text-align: center;">
              Powered by Appleseed — Teacher gifts, handled.
            </p>
          </div>
        `,
      });

      // 4. Update delivery as sent
      await supabase
        .from("deliveries")
        .update({
          status: "sent",
          gift_card_order_id: orderId,
          gift_card_code: redemptionUrl || "",
        })
        .eq("id", delivery.id);

      // 5. Update pool status
      await supabase
        .from("pools")
        .update({ status: "delivered" })
        .eq("id", delivery.pool_id);

      delivered++;
    } catch (error) {
      console.error(`Delivery ${delivery.id} failed:`, error);
      await supabase
        .from("deliveries")
        .update({
          status: "pending",
          retry_count: delivery.retry_count + 1,
          last_error: error instanceof Error ? error.message : "Unknown error",
        })
        .eq("id", delivery.id);
    }
  }

  return NextResponse.json({ delivered });
}
