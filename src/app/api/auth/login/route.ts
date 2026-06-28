import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Collect cookies that signInWithOAuth wants to set (code_verifier)
  const cookieJar: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => { cookieJar.push(...list); },
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

  // Attach the code_verifier cookie to the same response that redirects to GitHub
  // so the browser has it when it comes back to /auth/callback
  const response = NextResponse.redirect(data.url);
  cookieJar.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
  });

  return response;
}
