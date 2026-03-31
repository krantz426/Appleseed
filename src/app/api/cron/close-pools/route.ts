import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();

  // Find pools past their deadline that are still active or extended
  const { data: expiredPools } = await supabase
    .from("pools")
    .select("*")
    .in("status", ["active", "extended"])
    .lt("deadline", new Date().toISOString());

  if (!expiredPools || expiredPools.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  let processed = 0;

  for (const pool of expiredPools) {
    // Calculate total collected
    const { data: totalData } = await supabase
      .from("contributions")
      .select("amount_cents")
      .eq("pool_id", pool.id)
      .eq("status", "completed");

    const totalCents = (totalData || []).reduce(
      (sum, c) => sum + c.amount_cents,
      0
    );

    if (totalCents > 0) {
      // Pool has contributions, close it and create delivery (no minimum)
      await supabase
        .from("pools")
        .update({ status: "closed" })
        .eq("id", pool.id);

      await supabase.from("deliveries").insert({
        pool_id: pool.id,
        gift_card_amount_cents: totalCents,
        gift_card_brand: pool.teacher_preferred_store || "amazon",
        status: "pending",
      });
    } else if (pool.status === "active") {
      // No contributions, extend deadline by 7 days (once)
      const newDeadline = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString();
      await supabase
        .from("pools")
        .update({
          status: "extended",
          deadline: newDeadline,
          extended_at: new Date().toISOString(),
        })
        .eq("id", pool.id);
    } else {
      // Already extended with no contributions, mark as refunded (nothing to refund)
      await supabase
        .from("pools")
        .update({ status: "refunded" })
        .eq("id", pool.id);
    }

    processed++;
  }

  return NextResponse.json({ processed });
}
