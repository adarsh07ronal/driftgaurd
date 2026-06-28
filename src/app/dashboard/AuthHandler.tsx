"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

// Handles implicit flow token in URL hash and saves github_username to profile
export default function AuthHandler() {
  const router = useRouter();

  useEffect(() => {
    // Strip ?code= from URL so Supabase doesn't re-process it on every render
    if (window.location.search.includes("code=")) {
      window.history.replaceState({}, "", window.location.pathname);
    }

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const user = session.user;
        const username = user.user_metadata?.user_name ?? user.user_metadata?.preferred_username;
        if (username) {
          await supabase.from("profiles").upsert({
            id: user.id,
            email: user.email ?? "",
            github_username: username,
          });
        }
        router.refresh();
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return null;
}
