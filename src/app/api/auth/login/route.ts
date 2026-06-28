import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Use supabase-js directly with implicit flow so NO code_verifier is generated.
  // Supabase will return #access_token=... in the hash instead of ?code=...
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: "implicit",
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      scopes: "user:email",
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(error?.message ?? "oauth_failed")}`, request.url)
    );
  }

  // No code_verifier needed — redirect straight to GitHub
  return NextResponse.redirect(data.url);
}
