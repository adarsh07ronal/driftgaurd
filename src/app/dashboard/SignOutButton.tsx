"use client";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/auth");
  };
  return (
    <button onClick={handleSignOut} className="text-xs text-muted-foreground hover:text-foreground">
      Sign out
    </button>
  );
}
