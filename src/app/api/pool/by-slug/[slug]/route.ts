import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createAdminSupabaseClient();

  const { data: pool, error } = await supabase
    .from("pools")
    .select("*, teachers(name, email), schools(name)")
    .eq("slug", slug)
    .single();

  if (error || !pool) {
    return NextResponse.json({ error: "Pool not found" }, { status: 404 });
  }

  // Get contributions (child names only, no amounts)
  const { data: contributions } = await supabase
    .from("contributions")
    .select("child_name, amount_cents")
    .eq("pool_id", pool.id)
    .eq("status", "completed");

  const childNames = (contributions || []).map(
    (c) => c.child_name || `A Family in ${pool.classroom_name}`
  );
  const collectedCents = (contributions || []).reduce(
    (sum, c) => sum + c.amount_cents,
    0
  );
  const contributorCount = (contributions || []).length;

  return NextResponse.json({
    id: pool.id,
    slug: pool.slug,
    teacherName: (pool.teachers as { name: string } | null)?.name || "Teacher",
    schoolName: (pool.schools as { name: string } | null)?.name || "School",
    classroomName: pool.classroom_name,
    grade: pool.grade,
    occasion: pool.occasion,
    deadline: pool.deadline,
    status: pool.status,
    targetAmountCents: pool.target_amount_cents,
    suggestedAmountCents: pool.suggested_amount_cents,
    message: pool.message,
    collectedCents,
    contributorCount,
    childNames,
  });
}
