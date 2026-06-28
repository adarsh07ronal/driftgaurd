"use client";
import { createClient } from "@/lib/supabase-browser";

export default function SignOutButton() {
  const handleSignOut = () => {
    const supabase = createClient();
    supabase.auth.signOut().finally(() => {
      window.location.replace("/auth");
    });
  };
  return (
    <button onClick={handleSignOut} className="text-xs text-muted-foreground hover:text-foreground">
      Sign out
    </button>
  );
}
