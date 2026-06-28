import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/auth?error=no_code", origin));
  }

  const successResponse = NextResponse.redirect(new URL("/dashboard", origin));
  const errorUrl = (msg: string) =>
    NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(msg)}`, origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookies on the redirect response so the browser receives them
          cookiesToSet.forEach(({ name, value, options }) => {
            successResponse.cookies.set(name, value, options as Parameters<typeof successResponse.cookies.set>[2]);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return errorUrl(error?.message ?? "auth_failed");
  }

  const user = data.session.user;
  const username =
    user.user_metadata?.user_name ?? user.user_metadata?.preferred_username;
  if (user && username) {
    // Use service role to bypass RLS for the upsert
    const { createClient } = await import("@supabase/supabase-js");
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await serviceClient.from("profiles").upsert({
      id: user.id,
      email: user.email ?? "",
      github_username: username,
    });
  }

  return successResponse;
}
