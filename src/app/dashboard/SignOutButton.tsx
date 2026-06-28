"use client";
import { createClient } from "@/lib/supabase-browser";

export default function SignOutButton() {
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Hard navigate so server component re-runs and picks up cleared session
    window.location.href = "/auth";
  };
  return (
    <button onClick={handleSignOut} className="text-xs text-muted-foreground hover:text-foreground">
      Sign out
    </button>
  );
}
