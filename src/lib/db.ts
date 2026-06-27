import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { GithubInstallation, MonitoredRepo, PrCheck, UserProfile } from "@/types";

// ─── Browser client ──────────────────────────────────────────────────────────
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ─── Server client (with cookie auth) ───────────────────────────────────────
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs: Parameters<typeof cookieStore.setAll>[0]) => { try { cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
      },
    }
  );
}

// ─── Service role client (for webhook handlers — bypasses RLS) ───────────────
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ─── DB helpers ──────────────────────────────────────────────────────────────

export async function upsertInstallation(data: Omit<GithubInstallation, "installed_at">) {
  const db = createServiceClient();
  await db.from("github_installations").upsert({
    ...data,
    installed_at: new Date().toISOString(),
  });
}

export async function deleteInstallation(installationId: number) {
  const db = createServiceClient();
  await db.from("github_installations").delete().eq("id", installationId);
  await db.from("monitored_repos").delete().eq("installation_id", installationId);
}

export async function upsertMonitoredRepo(data: Omit<MonitoredRepo, "id" | "created_at">) {
  const db = createServiceClient();
  const { data: existing } = await db
    .from("monitored_repos")
    .select("id")
    .eq("repo_id", data.repo_id)
    .single();
  if (existing) return;
  await db.from("monitored_repos").insert({
    ...data,
    created_at: new Date().toISOString(),
  });
}

export async function removeMonitoredRepo(repoId: number) {
  const db = createServiceClient();
  await db.from("monitored_repos").delete().eq("repo_id", repoId);
}

export async function getMonitoredRepo(repoFullName: string): Promise<MonitoredRepo | null> {
  const db = createServiceClient();
  const { data } = await db
    .from("monitored_repos")
    .select("*")
    .eq("repo_full_name", repoFullName)
    .single();
  return data ?? null;
}

export async function logPrCheck(check: Omit<PrCheck, "id">) {
  const db = createServiceClient();
  await db.from("pr_checks").insert(check);
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const db = createServiceClient();
  const { data } = await db.from("profiles").select("*").eq("id", userId).single();
  return data ?? null;
}

export async function getUserInstallations(userId: string): Promise<GithubInstallation[]> {
  const db = createServiceClient();
  const { data } = await db
    .from("github_installations")
    .select("*")
    .eq("user_id", userId)
    .order("installed_at", { ascending: false });
  return data ?? [];
}

export async function getUserRepos(userId: string): Promise<MonitoredRepo[]> {
  const db = createServiceClient();
  const { data } = await db
    .from("monitored_repos")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getRecentChecks(userId: string, limit = 20): Promise<PrCheck[]> {
  const db = createServiceClient();
  const repos = await getUserRepos(userId);
  if (repos.length === 0) return [];
  const names = repos.map(r => r.repo_full_name);
  const { data } = await db
    .from("pr_checks")
    .select("*")
    .in("repo_full_name", names)
    .order("checked_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
