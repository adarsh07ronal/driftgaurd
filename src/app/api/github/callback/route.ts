import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getGithubUser, getGithubUserEmails } from "@/lib/github";
import { createServerSupabaseClient, createServiceClient } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (error) {
    return NextResponse.redirect(`${appUrl}/auth?error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/auth?error=no_code`);
  }

  try {
    // Exchange code for GitHub token
    const githubToken = await exchangeCodeForToken(code);
    const githubUser = await getGithubUser(githubToken);
    const emails = await getGithubUserEmails(githubToken);
    const primaryEmail = emails.find(e => e.primary && e.verified)?.email ?? emails[0]?.email;

    if (!primaryEmail) {
      return NextResponse.redirect(`${appUrl}/auth?error=no_email`);
    }

    // Sign in / sign up with Supabase
    const supabase = await createServerSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
      email: primaryEmail,
      options: {
        shouldCreateUser: true,
        data: {
          github_username: githubUser.login,
          github_avatar_url: githubUser.avatar_url,
          full_name: githubUser.name ?? githubUser.login,
        },
      },
    });

    if (authError) throw authError;

    // Get or create user profile
    const db = createServiceClient();
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    if (userId) {
      // Upsert profile
      await db.from("profiles").upsert({
        id: userId,
        email: primaryEmail,
        github_username: githubUser.login,
        github_avatar_url: githubUser.avatar_url,
        plan: "free",
      }, { onConflict: "id" });

      // Link any pending installations to this user
      await db
        .from("github_installations")
        .update({ user_id: userId })
        .eq("user_id", githubUser.login); // temp ID set during webhook

      await db
        .from("monitored_repos")
        .update({ user_id: userId })
        .eq("user_id", githubUser.login);
    }

    // Redirect to dashboard or install flow
    const installationId = state?.startsWith("install_") ? state.replace("install_", "") : null;
    const redirectTo = installationId
      ? `${appUrl}/dashboard?installed=${installationId}`
      : `${appUrl}/dashboard`;

    return NextResponse.redirect(redirectTo);
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(`${appUrl}/auth?error=oauth_failed`);
  }
}
