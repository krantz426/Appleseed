import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createCheckoutSession } from "@/lib/stripe/checkout";
import { calculateFee } from "@/lib/utils";
import { PRESET_AMOUNTS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { poolId, amountCents, childName, parentEmail, parentName, message } =
    body;

  if (!poolId || !amountCents || !parentEmail) {
    return NextResponse.json(
      { error: "Missing required fields: poolId, amountCents, parentEmail" },
      { status: 400 }
    );
  }

  if (amountCents < 100 || amountCents > 50000) {
    return NextResponse.json(
      { error: "Amount must be between $1 and $500" },
      { status: 400 }
    );
  }

  const supabase = createAdminSupabaseClient();

  // Verify pool exists and is active
  const { data: pool, error: poolError } = await supabase
    .from("pools")
    .select("id, slug, status, classroom_name, teachers(name), schools(name)")
    .eq("id", poolId)
    .single();

  if (poolError || !pool) {
    return NextResponse.json({ error: "Pool not found" }, { status: 404 });
  }

  if (pool.status !== "active" && pool.status !== "extended") {
    return NextResponse.json(
      { error: "This gift pool is no longer accepting contributions" },
      { status: 400 }
    );
  }

  const { fee, total } = calculateFee(amountCents);

  // Create contribution record (pending)
  const { data: contribution, error: contribError } = await supabase
    .from("contributions")
    .insert({
      pool_id: poolId,
      parent_email: parentEmail,
      parent_name: parentName || null,
      child_name: childName || null,
      amount_cents: amountCents,
      fee_cents: fee,
      total_cents: total,
      status: "pending",
      message: message || null,
    })
    .select("id")
    .single();

  if (contribError) {
    return NextResponse.json(
      { error: "Failed to create contribution" },
      { status: 500 }
    );
  }

  // Create Stripe Checkout Session
  const checkoutUrl = await createCheckoutSession({
    poolId,
    poolSlug: pool.slug,
    amountCents,
    feeCents: fee,
    totalCents: total,
    childName: childName || `A Family in ${pool.classroom_name}`,
    parentEmail,
    parentName: parentName || "",
    contributionId: contribution.id,
  });

  if (!checkoutUrl) {
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }

  return NextResponse.json({ checkoutUrl });
}
