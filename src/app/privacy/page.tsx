export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
      <div className="mb-10">
        <a href="/" className="font-mono font-medium text-sm tracking-tight">
          driftguard<span className="text-muted-foreground">.app</span>
        </a>
      </div>

      <h1 className="text-2xl font-semibold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: June 29, 2026</p>

      <div className="prose prose-sm max-w-none space-y-8 text-sm leading-relaxed">

        <section>
          <h2 className="font-semibold text-base mb-2">What driftguard does</h2>
          <p>driftguard is a GitHub App that checks pull requests for design system drift. It reads your <code>DESIGN.md</code> file and validates token references, contrast ratios, and structure on every PR.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">What data we access</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your GitHub username and email (via OAuth login)</li>
            <li>Repository metadata — name, owner, PR titles and numbers</li>
            <li>The contents of <code>DESIGN.md</code> from your repositories</li>
            <li>Pull request events (opened, synchronized, reopened)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">What we do NOT access</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your source code (only <code>DESIGN.md</code> is read)</li>
            <li>Private repository contents beyond <code>DESIGN.md</code></li>
            <li>Your GitHub password or tokens</li>
            <li>Any data outside of what is needed to run the design system check</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">What data we store</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your GitHub username and email to identify your account</li>
            <li>Installation records — which repositories have driftguard installed</li>
            <li>PR check results — repository name, PR number, branch, pass/fail status, error count</li>
          </ul>
          <p className="mt-2">We do not store the contents of your <code>DESIGN.md</code> or any source code.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">How we use your data</h2>
          <p>Data is used solely to operate driftguard — to run checks on pull requests and display results on your dashboard. We do not sell, share, or use your data for advertising.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">Data retention</h2>
          <p>Your data is retained as long as you have driftguard installed. You can delete your account and all associated data at any time by uninstalling driftguard from GitHub and contacting us.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">Third-party services</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>GitHub</strong> — for OAuth authentication and webhook events</li>
            <li><strong>Supabase</strong> — for database storage</li>
            <li><strong>Vercel</strong> — for hosting</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">Contact</h2>
          <p>For privacy questions or data deletion requests, contact us at <a href="mailto:adarsh07ronal@gmail.com" className="underline">adarsh07ronal@gmail.com</a>.</p>
        </section>

      </div>
    </main>
  );
}
