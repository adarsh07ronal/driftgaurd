import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "designmd — Design system enforcement for AI-generated code",
  description: "GitHub App that checks your DESIGN.md on every pull request. Catches contrast failures, broken token refs, and design drift before it merges.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased font-sans">{children}</body>
    </html>
  );
}
