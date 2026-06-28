"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Parse #access_token=...&refresh_token=... from URL hash directly
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token") ?? "";

    if (!access_token) {
      router.replace("/auth?error=no_token");
      return;
    }

    supabase.auth.setSession({ access_token, refresh_token }).then(async ({ data, error }) => {
      if (error || !data.session) {
        router.replace(`/auth?error=${encodeURIComponent(error?.message ?? "session_failed")}`);
        return;
      }

      const user = data.session.user;
      const username = user.user_metadata?.user_name ?? user.user_metadata?.preferred_username;
      if (username) {
        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email ?? "",
          github_username: username,
        });
      }

      // Clear hash from URL then navigate to dashboard
      window.history.replaceState(null, "", window.location.pathname);
      router.replace("/dashboard");
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="text-sm text-muted-foreground">Signing in…</span>
    </div>
  );
}
