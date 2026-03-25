import { CheckCircle, XCircle, AlertTriangle, Star, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Assessment, AssessmentStatus, FitCheck, JobQualityLabel, FitLabel } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ── Status configs ────────────────────────────────────────────────────────────

const OVERALL_CONFIG: Record<AssessmentStatus, { label: string; color: string; bg: string; border: string }> = {
  excellent: { label: "EXCELLENT", color: "text-emerald-400", bg: "bg-emerald-900/20", border: "border-emerald-700" },
  good:      { label: "GOOD",      color: "text-blue-400",    bg: "bg-blue-900/20",    border: "border-blue-700"    },
  caution:   { label: "CAUTION",   color: "text-amber-400",   bg: "bg-amber-900/20",   border: "border-amber-700"   },
  danger:    { label: "DANGER",    color: "text-red-400",     bg: "bg-red-900/20",     border: "border-red-700"     },
};

const JQ_CONFIG: Record<JobQualityLabel, { label: string; color: string; bg: string }> = {
  excellent: { label: "Excellent Deal",  color: "text-emerald-400", bg: "bg-emerald-900/20" },
  good:      { label: "Good Deal",       color: "text-blue-400",    bg: "bg-blue-900/20"    },
  marginal:  { label: "Marginal Deal",   color: "text-amber-400",   bg: "bg-amber-900/20"   },
  poor:      { label: "Poor Deal",       color: "text-red-400",     bg: "bg-red-900/20"     },
};

const FIT_CONFIG: Record<FitLabel, { label: string; color: string; bg: string }> = {
  strong:  { label: "Strong Fit",  color: "text-emerald-400", bg: "bg-emerald-900/20" },
  good:    { label: "Good Fit",    color: "text-blue-400",    bg: "bg-blue-900/20"    },
  caution: { label: "Caution",     color: "text-amber-400",   bg: "bg-amber-900/20"   },
  poor:    { label: "Poor Fit",    color: "text-red-400",     bg: "bg-red-900/20"     },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreGauge({ score, color }: { score: number; color: string }) {
  return (
    <div className="relative">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>0</span><span>50</span><span>100</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-700 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}

function CheckRow({ check }: { check: FitCheck }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-800 last:border-0">
      <div className="mt-0.5 flex-shrink-0">
        {check.passed
          ? <CheckCircle className="h-4 w-4 text-emerald-400" />
          : <XCircle className="h-4 w-4 text-red-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={cn("text-sm font-medium", check.passed ? "text-slate-200" : "text-red-300")}>
            {check.label}
          </p>
          <span className="text-xs text-slate-500 flex-shrink-0">
            {check.points}/{check.max}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{check.detail}</p>
      </div>
    </div>
  );
}

function BreakdownRow({ label, value, points, max }: { label: string; value: string | number; points: number; max: number }) {
  const pct = max > 0 ? (points / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 truncate">{label}</p>
        <p className="text-xs text-slate-500">{String(value)}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-16 h-1.5 rounded-full bg-slate-700 overflow-hidden">
          <div
            className={cn("h-full rounded-full", pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500")}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={cn("text-xs font-semibold w-8 text-right", pct >= 70 ? "text-emerald-400" : pct >= 40 ? "text-amber-400" : "text-red-400")}>
          {points}/{max}
        </span>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ResultsDisplay({ assessment }: { assessment: Assessment }) {
  const results = assessment.results;
  if (!results) return null;

  const { job_quality, fit, status, verdict } = results;
  const overallCfg = OVERALL_CONFIG[status];
  const jqCfg = JQ_CONFIG[job_quality.label];
  const fitCfg = FIT_CONFIG[fit.label];

  return (
    <div className="space-y-6">
      {/* Overall Banner */}
      <div className={cn("rounded-xl border p-5 flex items-start gap-4", overallCfg.border, overallCfg.bg)}>
        <div>
          {status === "excellent" && <Star className="h-7 w-7 text-emerald-400" />}
          {status === "good" && <CheckCircle className="h-7 w-7 text-blue-400" />}
          {status === "caution" && <AlertTriangle className="h-7 w-7 text-amber-400" />}
          {status === "danger" && <XCircle className="h-7 w-7 text-red-400" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={status} className="text-sm px-3 py-0.5">{overallCfg.label}</Badge>
            <span className="text-slate-400 text-sm">{assessment.title}</span>
          </div>
          <p className="text-slate-200 text-sm leading-relaxed">{verdict}</p>
        </div>
        <div className="text-right hidden sm:block flex-shrink-0">
          {assessment.contract_value != null && (
            <p className="text-xs text-slate-500 mb-0.5">Contract</p>
          )}
          {assessment.contract_value != null && (
            <p className="text-sm font-bold text-white">{formatCurrency(assessment.contract_value)}</p>
          )}
        </div>
      </div>

      {/* Two Panel Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Panel 1: Job Quality */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <CardTitle className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Job Quality Score
              </CardTitle>
            </div>
            <div className="flex items-end gap-2">
              <span className={cn("text-4xl font-bold", jqCfg.color)}>{job_quality.score}</span>
              <span className="text-slate-500 text-lg mb-1">/100</span>
              <span className={cn("ml-auto text-sm font-semibold px-2.5 py-1 rounded-lg", jqCfg.color, jqCfg.bg)}>
                {jqCfg.label}
              </span>
            </div>
            <ScoreGauge
              score={job_quality.score}
              color={job_quality.score >= 75 ? "bg-emerald-500" : job_quality.score >= 55 ? "bg-blue-500" : job_quality.score >= 35 ? "bg-amber-500" : "bg-red-500"}
            />
            <p className="text-xs text-slate-500 mt-1">Based on contract terms only — independent of your business</p>
          </CardHeader>
          <CardContent className="pt-0">
            <Separator className="mb-3" />
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Breakdown</div>
            {Object.entries(job_quality.breakdown).map(([key, item]) => (
              <BreakdownRow
                key={key}
                label={item.label}
                value={item.value ?? "—"}
                points={item.points}
                max={item.max}
              />
            ))}
            {job_quality.contract_value > 0 && (
              <>
                <Separator className="my-3" />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Margin</p>
                    <p className={cn("font-semibold", job_quality.margin_percent >= 15 ? "text-emerald-400" : "text-amber-400")}>
                      {job_quality.margin_percent.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Expected Profit</p>
                    <p className="font-semibold text-white">{formatCurrency(job_quality.expected_profit)}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Panel 2: Fit Score */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-violet-400" />
              <CardTitle className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Fit Score (For Your Business)
              </CardTitle>
            </div>
            <div className="flex items-end gap-2">
              <span className={cn("text-4xl font-bold", fitCfg.color)}>{fit.score}</span>
              <span className="text-slate-500 text-lg mb-1">/100</span>
              <span className={cn("ml-auto text-sm font-semibold px-2.5 py-1 rounded-lg", fitCfg.color, fitCfg.bg)}>
                {fitCfg.label}
              </span>
            </div>
            <ScoreGauge
              score={fit.score}
              color={fit.score >= 75 ? "bg-emerald-500" : fit.score >= 55 ? "bg-violet-500" : fit.score >= 35 ? "bg-amber-500" : "bg-red-500"}
            />
            <p className="text-xs text-slate-500 mt-1">Based on your company profile — cashflow, capacity, margin target</p>
          </CardHeader>
          <CardContent className="pt-0">
            <Separator className="mb-3" />
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Financial Checks</div>
            {Object.values(fit.checks).map((check) => (
              <CheckRow key={check.label} check={check as FitCheck} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
