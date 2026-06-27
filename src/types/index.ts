export type PlanTier = "free" | "pro" | "team" | "enterprise";

export interface UserProfile {
  id: string;
  email: string;
  plan: PlanTier;
  stripe_customer_id?: string;
  created_at: string;
}

export interface GithubInstallation {
  id: number;
  user_id: string;
  account_login: string;
  account_type: "User" | "Organization";
  account_avatar_url: string;
  installed_at: string;
  suspended: boolean;
}

export interface MonitoredRepo {
  id: string;
  installation_id: number;
  user_id: string;
  repo_full_name: string;   // e.g. "acmecorp/frontend"
  repo_id: number;
  enabled: boolean;
  block_on_error: boolean;  // fail commit status on lint errors
  created_at: string;
}

export interface PrCheck {
  id: string;
  repo_full_name: string;
  pr_number: number;
  pr_title: string;
  sha: string;
  branch: string;
  status: "passed" | "warned" | "failed" | "no_file";
  errors: number;
  warnings: number;
  comment_url?: string;
  checked_at: string;
}

export type LintSeverity = "error" | "warning" | "info";

export interface LintFinding {
  severity: LintSeverity;
  rule: string;
  path: string;
  message: string;
  line?: number;
}

export interface LintReport {
  findings: LintFinding[];
  summary: { errors: number; warnings: number; info: number };
}

export interface DesignSystem {
  version?: string;
  name: string;
  description?: string;
  colors: Record<string, string>;
  typography: Record<string, {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string | number;
    lineHeight?: string;
    letterSpacing?: string;
  } | undefined>;
  spacing: Record<string, string | number>;
  rounded: Record<string, string>;
  components?: Record<string, Record<string, string | undefined>>;
}

export interface WebhookPayload {
  action: string;
  installation: { id: number };
  sender: { login: string; avatar_url: string; type: string };
  repository?: {
    id: number;
    full_name: string;
    private: boolean;
    owner: { login: string; type: string };
  };
  pull_request?: {
    number: number;
    title: string;
    head: { sha: string; ref: string };
    html_url: string;
  };
  repositories_added?: Array<{ id: number; full_name: string; private: boolean }>;
  repositories_removed?: Array<{ id: number; full_name: string }>;
}
