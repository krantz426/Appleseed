import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const { email, source } = await request.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();

  const { error } = await supabase
    .from("waitlist")
    .upsert({ email: email.toLowerCase(), source: source || "landing" }, {
      onConflict: "email",
    });

  if (error) {
    return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
