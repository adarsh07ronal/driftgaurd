import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import crypto from "crypto";

const APP_ID = process.env.GITHUB_APP_ID!;
const PRIVATE_KEY = (process.env.GITHUB_APP_PRIVATE_KEY || "").replace(/\\n/g, "\n");
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET!;

// ─── Webhook signature verification ──────────────────────────────────────────

export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  if (!WEBHOOK_SECRET) return false;
  const expected = "sha256=" + crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    );
  } catch {
    return false;
  }
}

// ─── Installation token ───────────────────────────────────────────────────────

export async function getInstallationOctokit(installationId: number): Promise<Octokit> {
  const auth = createAppAuth({ appId: APP_ID, privateKey: PRIVATE_KEY });
  const { token } = await auth({ type: "installation", installationId });
  return new Octokit({ auth: token });
}

// ─── App-level Octokit (for listing installations, etc.) ────────────────────

export function getAppOctokit(): Octokit {
  const auth = createAppAuth({ appId: APP_ID, privateKey: PRIVATE_KEY });
  return new Octokit({ authStrategy: createAppAuth, auth: { appId: APP_ID, privateKey: PRIVATE_KEY } });
}

// ─── GitHub OAuth helpers ────────────────────────────────────────────────────

export function getOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/github/callback`,
    scope: "user:email",
    state,
  });
  return `https://github.com/login/oauth/authorize?${params}`;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  const data = await res.json() as { access_token?: string; error?: string };
  if (!data.access_token) throw new Error(data.error || "OAuth exchange failed");
  return data.access_token;
}

export async function getGithubUser(token: string) {
  const octokit = new Octokit({ auth: token });
  const { data } = await octokit.users.getAuthenticated();
  return data;
}

export async function getGithubUserEmails(token: string) {
  const octokit = new Octokit({ auth: token });
  const { data } = await octokit.users.listEmailsForAuthenticatedUser();
  return data;
}

// ─── Fetch file from repo ────────────────────────────────────────────────────

export async function fetchFileContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  ref: string
): Promise<string | null> {
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path, ref });
    if ("content" in data && data.content) {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }
    return null;
  } catch {
    return null;
  }
}

// ─── PR comment ──────────────────────────────────────────────────────────────

export async function upsertPRComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
  body: string,
  existingCommentId?: number
): Promise<number> {
  if (existingCommentId) {
    const { data } = await octokit.issues.updateComment({
      owner, repo, comment_id: existingCommentId, body,
    });
    return data.id;
  }
  const { data } = await octokit.issues.createComment({
    owner, repo, issue_number: prNumber, body,
  });
  return data.id;
}

// ─── Find existing designmd comment on PR ───────────────────────────────────

export async function findExistingComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number
): Promise<number | undefined> {
  const { data: comments } = await octokit.issues.listComments({
    owner, repo, issue_number: prNumber, per_page: 100,
  });
  const marker = "<!-- designmd-bot -->";
  const found = comments.find((c) => c.body?.includes(marker));
  return found?.id;
}

// ─── Commit status ───────────────────────────────────────────────────────────

export async function setCommitStatus(
  octokit: Octokit,
  owner: string,
  repo: string,
  sha: string,
  state: "pending" | "success" | "failure" | "error",
  description: string
): Promise<void> {
  await octokit.repos.createCommitStatus({
    owner,
    repo,
    sha,
    state,
    description: description.slice(0, 140),
    context: "designmd / lint",
    target_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });
}
