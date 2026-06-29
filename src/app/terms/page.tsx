export default function TermsPage() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
      <div className="mb-10">
        <a href="/" className="font-mono font-medium text-sm tracking-tight">
          driftguard<span className="text-muted-foreground">.app</span>
        </a>
      </div>

      <h1 className="text-2xl font-semibold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: June 29, 2026</p>

      <div className="prose prose-sm max-w-none space-y-8 text-sm leading-relaxed">

        <section>
          <h2 className="font-semibold text-base mb-2">1. Acceptance</h2>
          <p>By installing or using driftguard, you agree to these Terms of Service. If you do not agree, do not install or use the app.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">2. What driftguard provides</h2>
          <p>driftguard is a GitHub App that checks pull requests against a <code>DESIGN.md</code> design system specification. It posts check results and comments on pull requests in repositories where it is installed.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">3. Your responsibilities</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>You are responsible for the content of your <code>DESIGN.md</code> files</li>
            <li>You must comply with GitHub's Terms of Service</li>
            <li>You must not use driftguard to violate any laws or third-party rights</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">4. No warranty</h2>
          <p>driftguard is provided "as is" without warranty of any kind. We do not guarantee that the service will be error-free, uninterrupted, or that check results will be accurate in all cases.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">5. Limitation of liability</h2>
          <p>driftguard is not liable for any damages arising from the use or inability to use the service, including but not limited to missed design drift, incorrect check results, or service downtime.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">6. Modifications</h2>
          <p>We may update these terms at any time. Continued use of driftguard after changes constitutes acceptance of the updated terms.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">7. Termination</h2>
          <p>You may stop using driftguard at any time by uninstalling the GitHub App. We may suspend access to the service for violations of these terms.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">8. Contact</h2>
          <p>Questions about these terms? Contact us at <a href="mailto:adarsh07ronal@gmail.com" className="underline">adarsh07ronal@gmail.com</a>.</p>
        </section>

      </div>
    </main>
  );
}
