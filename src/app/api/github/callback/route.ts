import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (!code) {
    return NextResponse.redirect(`${appUrl}/auth?error=no_code`);
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth exchange error:", error.message);
      return NextResponse.redirect(`${appUrl}/auth?error=oauth_failed`);
    }

    return NextResponse.redirect(`${appUrl}${next}`);
  } catch (err) {
    console.error("Callback error:", err);
    return NextResponse.redirect(`${appUrl}/auth?error=oauth_failed`);
  }
}
