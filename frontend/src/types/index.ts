export interface User {
  id: string;
  name: string;
  email: string;
  company_name: string;
  registration_number?: string | null;
  address?: string | null;
  created_at: string;
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
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ── Questions ────────────────────────────────────────────────────────────────

export interface QuestionOption {
  label: string;
  value: number;
}

export interface Question {
  id: string;
  label: string;
  help?: string;
  type?: string;
  options?: QuestionOption[];
  prefix?: string;
  suffix?: string;
  default?: number;
  group?: string;
  groupLabel?: string;
}

export interface QuestionSection {
  id: string;
  title: string;
  description?: string;
  type: "scored_radio" | "numeric";
  questions: Question[];
}

export interface QuestionsConfig {
  sections: QuestionSection[];
}

// ── Assessments ──────────────────────────────────────────────────────────────

export type AssessmentStatus = "excellent" | "good" | "caution" | "danger";

export interface AssessmentListItem {
  id: string;
  title: string;
  created_at: string;
  status: AssessmentStatus;
  contract_value?: number | null;
  commercial_score?: number | null;
  execution_score?: number | null;
}

export interface CommercialBreakdownItem {
  id: string;
  value: number;
}

export interface CommercialResult {
  score: number;
  breakdown: CommercialBreakdownItem[];
}

export interface ExecutionResult {
  score: number;
  contract_value: number;
  total_cost: number;
  expected_profit: number;
  margin_percent: number;
  meets_target: boolean;
  target_margin: number;
  weekly_burn: number;
  cash_required: number;
  cash_reserves: number;
  can_afford: boolean;
  months_buffer: number;
  can_survive: boolean;
  job_size_ratio: number;
  is_too_big: boolean;
  worst_case_total_cost: number;
  worst_case_duration_weeks: number;
  worst_case_margin_percent: number;
}

export interface AssessmentResults {
  commercial_score: number;
  execution_score: number;
  status: AssessmentStatus;
  recommendation: string;
  commercial: CommercialResult;
  execution: ExecutionResult;
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
  answers: {
    commercial: Record<string, number>;
    execution: Record<string, number>;
  };
}
