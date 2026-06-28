"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      router.replace("/auth?error=no_code");
      return;
    }
    supabase.auth.exchangeCodeForSession(code).then(async ({ data, error }) => {
      if (error) {
        router.replace(`/auth?error=${encodeURIComponent(error.message)}`);
        return;
      }
      // Save GitHub username to profile so dashboard can match installations
      const user = data.session?.user;
      const username = user?.user_metadata?.user_name ?? user?.user_metadata?.preferred_username;
      if (user && username) {
        await supabase.from("profiles").upsert({ id: user.id, email: user.email ?? "", github_username: username });
      }
      router.replace("/dashboard");
    });
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <span className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
    </main>
  );
}
