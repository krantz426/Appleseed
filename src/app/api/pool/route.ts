import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    teacherName,
    teacherEmail,
    schoolName,
    classroomName,
    grade,
    targetAmountCents,
    suggestedAmountCents,
    deadline,
    occasion,
    message,
    preferredStore,
  } = body;

  if (!teacherName || !schoolName || !classroomName || !deadline || !occasion) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Get or create parent record
  let { data: parent } = await supabase
    .from("parents")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!parent) {
    const { data: newParent, error: parentError } = await supabase
      .from("parents")
      .insert({
        auth_id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email!.split("@")[0],
      })
      .select("id")
      .single();
    if (parentError) {
      return NextResponse.json({ error: parentError.message }, { status: 500 });
    }
    parent = newParent;
  }

  // Create school
  const { data: school, error: schoolError } = await supabase
    .from("schools")
    .insert({ name: schoolName })
    .select("id")
    .single();
  if (schoolError) {
    return NextResponse.json({ error: schoolError.message }, { status: 500 });
  }

  // Create teacher
  const { data: teacher, error: teacherError } = await supabase
    .from("teachers")
    .insert({
      name: teacherName,
      school_id: school.id,
      email: teacherEmail || null,
    })
    .select("id")
    .single();
  if (teacherError) {
    return NextResponse.json({ error: teacherError.message }, { status: 500 });
  }

  // Create pool
  const slug = generateSlug(teacherName, occasion);
  const { data: pool, error: poolError } = await supabase
    .from("pools")
    .insert({
      slug,
      room_parent_id: parent.id,
      teacher_id: teacher.id,
      classroom_name: classroomName,
      grade: grade || null,
      school_id: school.id,
      target_amount_cents: targetAmountCents || 37500,
      suggested_amount_cents: suggestedAmountCents || 1500,
      deadline: new Date(deadline).toISOString(),
      occasion,
      message: message || null,
      teacher_email: teacherEmail || null,
      teacher_preferred_store: preferredStore || "amazon",
    })
    .select("*")
    .single();

  if (poolError) {
    return NextResponse.json({ error: poolError.message }, { status: 500 });
  }

  return NextResponse.json({
    pool,
    shareableLink: `${process.env.NEXT_PUBLIC_APP_URL || ""}/p/${slug}`,
  });
}
