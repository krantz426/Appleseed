import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ poolId: string }> }
) {
  const { poolId } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: pool, error } = await supabase
    .from("pools")
    .select(
      `
      *,
      teachers(name, email),
      schools(name)
    `
    )
    .eq("id", poolId)
    .single();

  if (error || !pool) {
    return NextResponse.json({ error: "Pool not found" }, { status: 404 });
  }

  // Get aggregated contribution data (no individual amounts exposed)
  const { data: contributions } = await supabase
    .from("contributions")
    .select("child_name")
    .eq("pool_id", poolId)
    .eq("status", "completed");

  const { count: contributorCount } = await supabase
    .from("contributions")
    .select("*", { count: "exact", head: true })
    .eq("pool_id", poolId)
    .eq("status", "completed");

  // Calculate total collected using sum
  const { data: totalData } = await supabase.rpc("pool_collected_cents_by_id", {
    p_pool_id: poolId,
  });

  const childNames = (contributions || [])
    .map((c) => c.child_name || `A Family in ${pool.classroom_name}`)
    .filter(Boolean);

  return NextResponse.json({
    id: pool.id,
    slug: pool.slug,
    teacherName: pool.teachers?.name,
    schoolName: pool.schools?.name,
    classroomName: pool.classroom_name,
    grade: pool.grade,
    occasion: pool.occasion,
    deadline: pool.deadline,
    status: pool.status,
    targetAmountCents: pool.target_amount_cents,
    suggestedAmountCents: pool.suggested_amount_cents,
    message: pool.message,
    collectedCents: totalData || 0,
    contributorCount: contributorCount || 0,
    childNames,
  });
}
