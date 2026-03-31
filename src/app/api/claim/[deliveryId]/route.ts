import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deliveryId: string }> }
) {
  const { deliveryId } = await params;
  const token = new URL(request.url).searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();

  const { data: delivery, error } = await supabase
    .from("deliveries")
    .select("*, pools(*, teachers(name), schools(name))")
    .eq("id", deliveryId)
    .eq("teacher_claim_token", token)
    .single();

  if (error || !delivery) {
    return NextResponse.json({ error: "Invalid claim link" }, { status: 404 });
  }

  const pool = delivery.pools as {
    id: string;
    classroom_name: string;
    occasion: string;
    message: string | null;
    teachers: { name: string } | null;
    schools: { name: string } | null;
  } | null;

  // Get child names
  const { data: contributions } = await supabase
    .from("contributions")
    .select("child_name")
    .eq("pool_id", delivery.pool_id)
    .eq("status", "completed");

  const childNames = (contributions || []).map(
    (c) => c.child_name || `A Family in ${pool?.classroom_name || "the class"}`
  );

  // Mark as claimed if not already
  if (!delivery.claimed_at) {
    await supabase
      .from("deliveries")
      .update({ status: "claimed", claimed_at: new Date().toISOString() })
      .eq("id", deliveryId);
  }

  return NextResponse.json({
    teacherName: pool?.teachers?.name || "Teacher",
    classroomName: pool?.classroom_name || "",
    schoolName: pool?.schools?.name || "",
    occasion: pool?.occasion || "",
    giftCardCode: delivery.gift_card_code || "",
    giftCardBrand: delivery.gift_card_brand || "amazon",
    giftCardAmountCents: delivery.gift_card_amount_cents || 0,
    childNames,
    message: pool?.message || null,
    alreadyClaimed: !!delivery.claimed_at,
  });
}
