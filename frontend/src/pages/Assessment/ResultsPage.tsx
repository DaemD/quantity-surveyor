import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Star, TrendingUp, Banknote, Shield } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAssessment } from "@/hooks/useAssessments";
import type { AssessmentResults, AssessmentStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_CONFIG: Record<AssessmentStatus, { label: string; color: string; bg: string; border: string }> = {
  excellent: { label: "EXCELLENT", color: "text-emerald-400", bg: "bg-emerald-900/20", border: "border-emerald-700" },
  good: { label: "GOOD", color: "text-blue-400", bg: "bg-blue-900/20", border: "border-blue-700" },
  caution: { label: "CAUTION", color: "text-amber-400", bg: "bg-amber-900/20", border: "border-amber-700" },
  danger: { label: "DANGER", color: "text-red-400", bg: "bg-red-900/20", border: "border-red-700" },
};

function StatusIcon({ status }: { status: AssessmentStatus }) {
  if (status === "excellent") return <Star className="h-8 w-8 text-emerald-400" />;
  if (status === "good") return <CheckCircle className="h-8 w-8 text-blue-400" />;
  if (status === "caution") return <AlertTriangle className="h-8 w-8 text-amber-400" />;
  return <XCircle className="h-8 w-8 text-red-400" />;
}

function CheckRow({ label, passed, detail }: { label: string; passed: boolean; detail?: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="mt-0.5 flex-shrink-0">
        {passed
          ? <CheckCircle className="h-4 w-4 text-emerald-400" />
          : <XCircle className="h-4 w-4 text-red-400" />}
      </div>
      <div className="min-w-0">
        <p className={`text-sm font-medium ${passed ? "text-slate-200" : "text-red-300"}`}>{label}</p>
        {detail && <p className="text-xs text-slate-500 mt-0.5">{detail}</p>}
      </div>
    </div>
  );
}

function ResultsContent({ results, title, createdAt }: { results: AssessmentResults; title: string; createdAt: string }) {
  const navigate = useNavigate();
  const cfg = STATUS_CONFIG[results.status];
  const exec = results.execution;
  const commercial = results.commercial;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-slate-400 text-sm">{title}</span>
        <span className="text-slate-600 text-xs ml-auto">{formatDate(createdAt)}</span>
      </div>

      {/* Overall status banner */}
      <div className={`rounded-xl border ${cfg.border} ${cfg.bg} p-6 mb-8 flex items-center gap-6`}>
        <StatusIcon status={results.status} />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <Badge variant={results.status} className="text-sm px-3 py-1">{cfg.label}</Badge>
          </div>
          <p className="text-slate-200 font-medium">{results.recommendation}</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-slate-500 mb-1">Scores</p>
          <p className="text-sm font-semibold text-white">
            Commercial: <span className={results.commercial_score >= 0 ? "text-emerald-400" : "text-red-400"}>
              {results.commercial_score > 0 ? "+" : ""}{results.commercial_score}/20
            </span>
          </p>
          <p className="text-sm font-semibold text-white">
            Execution: <span className={results.execution_score >= 0 ? "text-emerald-400" : "text-red-400"}>
              {results.execution_score > 0 ? "+" : ""}{results.execution_score}
            </span>
          </p>
        </div>
      </div>

      {/* Executive summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scope & Opportunity</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {exec.is_too_big
                ? `Contract value of ${formatCurrency(exec.contract_value)} is ${exec.job_size_ratio.toFixed(1)}x your average — larger than typical.`
                : `Contract value of ${formatCurrency(exec.contract_value)} is within your normal operating range (${exec.job_size_ratio.toFixed(1)}x avg).`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Value for Money</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {exec.meets_target
                ? `Margin of ${exec.margin_percent.toFixed(1)}% exceeds your ${exec.target_margin}% target — profitable contract.`
                : `Margin of ${exec.margin_percent.toFixed(1)}% is below your ${exec.target_margin}% target — review cost estimates.`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Banknote className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contractor Viability</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {exec.can_afford
                ? `You have ${formatCurrency(exec.cash_reserves)} cash — sufficient to cover the ${exec.job_size_ratio < 1 ? "smaller" : ""} early cashflow demands.`
                : `Cash reserves of ${formatCurrency(exec.cash_reserves)} may be insufficient. You need approx. ${formatCurrency(exec.cash_required)} to fund early works.`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detail panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Commercial */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Commercial Risk</span>
              <span className={`text-base ${results.commercial_score >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {results.commercial_score > 0 ? "+" : ""}{results.commercial_score} / 20
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>-20 (High risk)</span>
                <span>+20 (Low risk)</span>
              </div>
              <div className="relative h-2 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className={`absolute top-0 h-full rounded-full transition-all ${results.commercial_score >= 0 ? "bg-emerald-500" : "bg-red-500"}`}
                  style={{ width: `${((results.commercial_score + 20) / 40) * 100}%` }}
                />
              </div>
            </div>
            <div className="space-y-0 divide-y divide-slate-800">
              {commercial.breakdown.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-300 capitalize">{item.id.replace(/([A-Z])/g, " $1").trim()}</span>
                  <span className={`text-sm font-semibold ${item.value > 0 ? "text-emerald-400" : item.value < 0 ? "text-red-400" : "text-slate-400"}`}>
                    {item.value > 0 ? "+" : ""}{item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Execution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Financial Checks</span>
              <span className={`text-base ${results.execution_score >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {results.execution_score > 0 ? "+" : ""}{results.execution_score} pts
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CheckRow
              label="Profit Margin"
              passed={exec.meets_target}
              detail={`${exec.margin_percent.toFixed(1)}% margin vs ${exec.target_margin}% target — Profit: ${formatCurrency(exec.expected_profit)}`}
            />
            <CheckRow
              label="Cashflow Affordability"
              passed={exec.can_afford}
              detail={`Need ${formatCurrency(exec.cash_required)} upfront — Have ${formatCurrency(exec.cash_reserves)}`}
            />
            <CheckRow
              label="Survival Buffer"
              passed={exec.can_survive}
              detail={`${exec.months_buffer.toFixed(1)} months overhead cover (min 3 required)`}
            />
            <CheckRow
              label="Job Size"
              passed={!exec.is_too_big}
              detail={`${exec.job_size_ratio.toFixed(1)}x average contract size (max 2.5x recommended)`}
            />
            <Separator className="my-3" />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Worst-case cost</span>
                <span className="text-white">{formatCurrency(exec.worst_case_total_cost)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Worst-case margin</span>
                <span className={exec.worst_case_margin_percent >= 0 ? "text-amber-400" : "text-red-400"}>
                  {exec.worst_case_margin_percent.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ViewAssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: assessment, isLoading, isError } = useAssessment(id ?? "");

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 text-slate-400">Loading…</div>
      </Layout>
    );
  }

  if (isError || !assessment) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <p className="text-slate-400 mb-4">Assessment not found.</p>
          <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ResultsContent
        results={assessment.results!}
        title={assessment.title}
        createdAt={assessment.created_at}
      />
    </Layout>
  );
}

export default ResultsContent;
