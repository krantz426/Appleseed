import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ poolId: string }> }
) {
  const { poolId } = await params;
  const supabase = await createServerSupabaseClient();

  // Verify the user is the room parent
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminSupabaseClient();

  const { data: pool } = await admin
    .from("pools")
    .select("*, parents!inner(auth_id)")
    .eq("id", poolId)
    .single();

  if (!pool || (pool.parents as { auth_id: string })?.auth_id !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  if (pool.status !== "active" && pool.status !== "extended") {
    return NextResponse.json({ error: "Pool is not active" }, { status: 400 });
  }

  // Calculate total
  const { data: contributions } = await admin
    .from("contributions")
    .select("amount_cents")
    .eq("pool_id", poolId)
    .eq("status", "completed");

  const totalCents = (contributions || []).reduce((sum, c) => sum + c.amount_cents, 0);

  if (totalCents === 0) {
    return NextResponse.json({ error: "No contributions to close" }, { status: 400 });
  }

  // Close pool and create delivery
  await admin.from("pools").update({ status: "closed" }).eq("id", poolId);

  await admin.from("deliveries").insert({
    pool_id: poolId,
    gift_card_amount_cents: totalCents,
    gift_card_brand: pool.teacher_preferred_store || "amazon",
    status: "pending",
  });

  return NextResponse.json({ success: true, totalCents });
}
