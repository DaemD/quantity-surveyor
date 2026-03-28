export interface User {
  id: string;
  name: string;
  email: string;
  company_name: string;
  registration_number?: string | null;
  address?: string | null;
  created_at: string;
  // Company profile
  primary_trade?: string | null;
  phone?: string | null;
  avg_contract_size?: number | null;
  target_margin?: number | null;
  monthly_fixed_costs?: number | null;
  labour_model?: string | null;
  cash_reserves?: number | null;
  years_trading?: number | null;
  growth_goal?: string | null;
  main_constraint?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  company_name: string;
  registration_number?: string;
  address?: string;
  primary_trade?: string;
  phone?: string;
  avg_contract_size?: number;
  target_margin?: number;
  monthly_fixed_costs?: number;
  labour_model?: string;
  cash_reserves?: number;
  years_trading?: number;
  growth_goal?: string;
  main_constraint?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ── Questions ────────────────────────────────────────────────────────────────

export interface SelectOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  label: string;
  type: "text" | "number" | "select" | "date" | "textarea";
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  help?: string;
  required?: boolean;
  options?: SelectOption[];
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface QuestionsConfig {
  sections: FormSection[];
}

// ── Assessments ──────────────────────────────────────────────────────────────

export type AssessmentStatus = "excellent" | "good" | "caution" | "danger";
export type JobQualityLabel = "excellent" | "good" | "marginal" | "poor";
export type FitLabel = "strong" | "good" | "caution" | "poor";

export interface AssessmentListItem {
  id: string;
  title: string;
  created_at: string;
  status: AssessmentStatus;
  contract_value?: number | null;
  commercial_score?: number | null;
  execution_score?: number | null;
}

export interface BreakdownItem {
  label: string;
  value: string | number;
  points: number;
  max: number;
}

export interface FitCheck {
  label: string;
  passed: boolean;
  points: number;
  max: number;
  detail: string;
  [key: string]: unknown;
}

export interface JobQualityResult {
  score: number;
  raw_points: number;
  max_points: number;
  label: JobQualityLabel;
  margin_percent: number;
  contract_value: number;
  total_cost: number;
  expected_profit: number;
  breakdown: Record<string, BreakdownItem>;
}

export interface FitResult {
  score: number;
  raw_points: number;
  max_points: number;
  label: FitLabel;
  checks: Record<string, FitCheck>;
}

export interface AssessmentResults {
  status: AssessmentStatus;
  verdict: string;
  job_quality: JobQualityResult;
  fit: FitResult;
  commercial_score: number;
  execution_score: number;
}

export interface Assessment {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  status: AssessmentStatus;
  contract_value?: number | null;
  commercial_score?: number | null;
  execution_score?: number | null;
  answers?: Record<string, unknown> | null;
  results?: AssessmentResults | null;
}

export interface CreateAssessmentPayload {
  title: string;
  answers: Record<string, unknown>;
}
