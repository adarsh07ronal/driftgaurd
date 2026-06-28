import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session?.user) {
      const user = data.session.user;
      const username =
        user.user_metadata?.user_name ?? user.user_metadata?.preferred_username;
      if (username) {
        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email ?? "",
          github_username: username,
        });
      }
      return NextResponse.redirect(`${origin}/dashboard`);
    }

    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(error?.message ?? "auth_failed")}`
    );
  }

  return NextResponse.redirect(`${origin}/auth?error=no_code`);
}
