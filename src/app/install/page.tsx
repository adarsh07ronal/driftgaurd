import Link from "next/link";

export default function InstallPage({
  searchParams,
}: {
  searchParams: { installation_id?: string; setup_action?: string };
}) {
  const { installation_id, setup_action } = searchParams;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="font-mono font-medium text-lg tracking-tight">
            designmd<span className="text-muted-foreground">.app</span>
          </span>
        </div>

        {setup_action === "install" && installation_id ? (
          // ── Successful install ──────────────────────────────────────────
          <div className="border rounded-xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold mb-2">GitHub App installed</h1>
            <p className="text-muted-foreground text-sm mb-6">
              designmd will now check your DESIGN.md on every pull request and post findings as PR comments.
            </p>

            <div className="space-y-3">
              <Link
                href={`/auth?installation_id=${installation_id}`}
                className="block w-full bg-foreground text-background text-sm font-medium py-2.5 rounded-md hover:opacity-90 text-center"
              >
                Connect your account →
              </Link>
              <p className="text-xs text-muted-foreground">
                Connecting your account lets you view PR history, configure repos, and upgrade your plan.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t text-left">
              <p className="text-xs font-medium text-muted-foreground mb-3">Next step — add a DESIGN.md to your repo</p>
              <div className="bg-muted rounded-lg p-3 font-mono text-xs">
                <p className="text-muted-foreground mb-1"># Option 1 — use our editor</p>
                <a href="/editor" className="text-foreground underline">designmd.app/editor</a>
                <p className="text-muted-foreground mt-2 mb-1"># Option 2 — AI generator</p>
                <p>Describe your brand → copy → commit as DESIGN.md</p>
              </div>
            </div>
          </div>
        ) : (
          // ── Manual install landing ──────────────────────────────────────
          <div className="border rounded-xl p-8 text-center">
            <h1 className="text-xl font-semibold mb-2">Install designmd</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Add the GitHub App to your repos and get automatic DESIGN.md enforcement on every PR.
            </p>
            <a
              href={process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL || "#"}
              className="block w-full bg-foreground text-background text-sm font-medium py-2.5 rounded-md hover:opacity-90 text-center mb-3"
            >
              Install on GitHub →
            </a>
            <p className="text-xs text-muted-foreground">
              Free for 1 repo · <Link href="/pricing" className="underline">View plans</Link>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
