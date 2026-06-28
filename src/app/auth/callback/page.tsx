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

    // With implicit flow, Supabase returns #access_token=... in the hash.
    // createBrowserClient auto-detects this via detectSessionInUrl (default true).
    // We just wait for the SIGNED_IN event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const user = session.user;
        const username =
          user.user_metadata?.user_name ?? user.user_metadata?.preferred_username;
        if (username) {
          await supabase.from("profiles").upsert({
            id: user.id,
            email: user.email ?? "",
            github_username: username,
          });
        }
        subscription.unsubscribe();
        router.replace("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="text-sm text-muted-foreground">Signing in…</span>
    </div>
  );
}
