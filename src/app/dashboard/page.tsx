import Link from "next/link";
import SignOutButton from "./SignOutButton";
import AuthHandler from "./AuthHandler";
import { createServerSupabaseClient, getRecentChecks, getUserInstallations, getUserRepos } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const [installations, repos, checks] = await Promise.all([
    getUserInstallations(user.id),
    getUserRepos(user.id),
    getRecentChecks(user.id, 15),
  ]);

  const statusColors = {
    passed: "text-green-600 bg-green-50 border-green-200",
    warned: "text-yellow-600 bg-yellow-50 border-yellow-200",
    failed: "text-red-600 bg-red-50 border-red-200",
    no_file: "text-muted-foreground bg-muted border-border",
  };

  const statusLabels = {
    passed: "✓ Passed",
    warned: "⚠ Warned",
    failed: "✗ Failed",
    no_file: "No file",
  };

  return (
    <main className="min-h-screen">
      <AuthHandler />
      {/* Nav */}
      <nav className="border-b px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-mono font-medium text-sm tracking-tight">
          driftgaurd<span className="text-muted-foreground">.app</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{user.email}</span>
          <SignOutButton />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Summary metrics */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: "Installations", value: installations.length },
            { label: "Repos monitored", value: repos.filter(r => r.enabled).length },
            { label: "PRs checked", value: checks.length },
            { label: "Issues found", value: checks.reduce((a, c) => a + c.errors + c.warnings, 0) },
          ].map((m) => (
            <div key={m.label} className="bg-muted rounded-lg p-4">
              <p className="text-2xl font-medium">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Repos */}
          <div className="col-span-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium">Repositories</h2>
              <a
                href={process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL || "#"}
                className="text-xs text-muted-foreground hover:text-foreground"
                target="_blank"
              >
                + Add repo
              </a>
            </div>

            {repos.length === 0 ? (
              <div className="border rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-3">No repos connected yet.</p>
                <a
                  href={process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL || "#"}
                  className="text-xs bg-foreground text-background px-3 py-1.5 rounded hover:opacity-90 inline-block"
                  target="_blank"
                >
                  Install GitHub App
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                {repos.map((repo) => (
                  <div key={repo.id} className="border rounded-lg px-3 py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium truncate max-w-[160px]">
                        {repo.repo_full_name.split("/")[1]}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {repo.repo_full_name.split("/")[0]}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded border ${repo.enabled ? "bg-green-50 text-green-700 border-green-200" : "bg-muted text-muted-foreground border-border"}`}>
                      {repo.enabled ? "Active" : "Paused"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Install CTA if no installations */}
            {installations.length === 0 && (
              <div className="mt-4 border rounded-lg p-4 bg-muted/50">
                <p className="text-xs font-medium mb-1">Get started</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Install the GitHub App to start checking PRs automatically.
                </p>
                <a
                  href={process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL || "/install"}
                  className="text-xs bg-foreground text-background px-3 py-1.5 rounded hover:opacity-90 inline-block"
                >
                  Install on GitHub →
                </a>
              </div>
            )}
          </div>

          {/* Right: Recent PR checks */}
          <div className="col-span-2">
            <h2 className="text-sm font-medium mb-3">Recent PR checks</h2>

            {checks.length === 0 ? (
              <div className="border rounded-lg p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No PR checks yet. Open a pull request in a connected repo to see results here.
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted text-xs text-muted-foreground">
                      <th className="text-left px-4 py-2.5 font-medium">Repository / PR</th>
                      <th className="text-left px-4 py-2.5 font-medium">Branch</th>
                      <th className="text-left px-4 py-2.5 font-medium">Result</th>
                      <th className="text-left px-4 py-2.5 font-medium">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checks.map((check, i) => (
                      <tr key={check.id} className={`border-t ${i % 2 === 0 ? "" : "bg-muted/30"}`}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-xs truncate max-w-[200px]">
                            {check.pr_title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {check.repo_full_name} #{check.pr_number}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-muted-foreground truncate max-w-[100px] block">
                            {check.branch}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded border ${statusColors[check.status]}`}>
                            {statusLabels[check.status]}
                          </span>
                          {(check.errors > 0 || check.warnings > 0) && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {check.errors > 0 && `${check.errors}E `}
                              {check.warnings > 0 && `${check.warnings}W`}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(check.checked_at).toLocaleDateString("en", {
                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
