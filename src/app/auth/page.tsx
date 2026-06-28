"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase-browser";

function AuthContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/api/github/callback`,
          scopes: "user:email",
        },
      });
      if (error) throw error;
    } catch (e) {
      setError("Authentication failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <span className="font-mono font-medium text-lg tracking-tight">
            driftgaurd<span className="text-muted-foreground">.app</span>
          </span>
          <p className="text-sm text-muted-foreground mt-2">Sign in to view your dashboard</p>
        </div>
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>
        )}
        <button onClick={handleSignIn} disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-foreground text-background py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
          {loading ? (
            <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          )}
          {loading ? "Signing in…" : "Continue with GitHub"}
        </button>
        <p className="text-xs text-center text-muted-foreground mt-4">We only request your email address. We never read your code.</p>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-sm text-muted-foreground">Loading...</span></div>}>
      <AuthContent />
    </Suspense>
  );
}
