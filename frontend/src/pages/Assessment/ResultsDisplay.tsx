import { CheckCircle, XCircle, AlertTriangle, Star, TrendingUp, Users, MinusCircle } from "lucide-react";
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

const JQ_CONFIG: Record<JobQualityLabel, { label: string; color: string; bg: string; bar: string }> = {
  excellent: { label: "Excellent Deal",  color: "text-emerald-400", bg: "bg-emerald-900/20", bar: "bg-emerald-500" },
  good:      { label: "Good Deal",       color: "text-blue-400",    bg: "bg-blue-900/20",    bar: "bg-blue-500"    },
  marginal:  { label: "Marginal Deal",   color: "text-amber-400",   bg: "bg-amber-900/20",   bar: "bg-amber-500"   },
  poor:      { label: "Poor Deal",       color: "text-red-400",     bg: "bg-red-900/20",     bar: "bg-red-500"     },
};

const FIT_CONFIG: Record<FitLabel, { label: string; color: string; bg: string; bar: string }> = {
  strong:  { label: "Strong Fit",  color: "text-emerald-400", bg: "bg-emerald-900/20", bar: "bg-emerald-500" },
  good:    { label: "Good Fit",    color: "text-blue-400",    bg: "bg-blue-900/20",    bar: "bg-violet-500"  },
  caution: { label: "Caution",     color: "text-amber-400",   bg: "bg-amber-900/20",   bar: "bg-amber-500"   },
  poor:    { label: "Poor Fit",    color: "text-red-400",     bg: "bg-red-900/20",     bar: "bg-red-500"     },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function ScoreGauge({ score, barColor }: { score: number; barColor: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-600 mb-1.5">
        <span>0</span><span>50</span><span>100</span>
      </div>
      <div className="h-3 rounded-full bg-slate-700/60 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", barColor)}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}

function factorColor(pct: number) {
  if (pct >= 70) return { bar: "bg-emerald-500", icon: "text-emerald-400", bg: "bg-emerald-900/20 border-emerald-800" };
  if (pct >= 40) return { bar: "bg-amber-500",   icon: "text-amber-400",   bg: "bg-amber-900/20 border-amber-800"   };
  return           { bar: "bg-red-500",    icon: "text-red-400",    bg: "bg-red-900/20 border-red-800"     };
}

function FactorIcon({ pct }: { pct: number }) {
  if (pct >= 70) return <CheckCircle className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />;
  if (pct >= 40) return <MinusCircle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />;
  return <XCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />;
}

// ── Job Quality Breakdown Row ─────────────────────────────────────────────────

function BreakdownRow({ label, value, points, max }: { label: string; value: string | number; points: number; max: number }) {
  const pct = max > 0 ? (points / max) * 100 : 0;
  const colors = factorColor(pct);

  return (
    <div className={cn("flex items-center gap-3 rounded-lg border px-3 py-2.5", colors.bg)}>
      <FactorIcon pct={pct} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-300">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{String(value) || "—"}</p>
      </div>
      <div className="w-20 flex-shrink-0">
        <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
          <div className={cn("h-full rounded-full", colors.bar)} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

// ── Fit Check Row ─────────────────────────────────────────────────────────────

function FitCheckRow({ check }: { check: FitCheck }) {
  const passed = check.passed as boolean;
  const points = check.points as number;
  const max = check.max as number;
  const pct = max > 0 ? (points / max) * 100 : 0;

  // Build extra context lines per check type
  const extras: string[] = [];
  if ("cash_needed" in check && "cash_reserves" in check) {
    extras.push(`Need: ${formatCurrency(check.cash_needed as number)} — Have: ${formatCurrency(check.cash_reserves as number)}`);
    if ("weekly_burn" in check) extras.push(`Weekly burn rate: ${formatCurrency(check.weekly_burn as number)}/week`);
  }
  if ("months_buffer" in check) {
    extras.push(`${(check.months_buffer as number).toFixed(1)} months of overheads covered — minimum recommended: 3 months`);
  }
  if ("actual_margin" in check && "target_margin" in check) {
    extras.push(`Your target: ${check.target_margin}% — This job: ${(check.actual_margin as number).toFixed(1)}%`);
  }
  if ("worst_margin_percent" in check) {
    extras.push(`Worst-case margin: ${(check.worst_margin_percent as number).toFixed(1)}%`);
  }

  return (
    <div className={cn(
      "rounded-lg border p-4",
      passed ? "bg-emerald-900/10 border-emerald-800/50" : pct > 0 ? "bg-amber-900/10 border-amber-800/50" : "bg-red-900/10 border-red-800/50"
    )}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          {passed
            ? <CheckCircle className="h-5 w-5 text-emerald-400" />
            : pct > 0
              ? <AlertTriangle className="h-5 w-5 text-amber-400" />
              : <XCircle className="h-5 w-5 text-red-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className={cn("text-sm font-semibold", passed ? "text-emerald-300" : pct > 0 ? "text-amber-300" : "text-red-300")}>
              {check.label as string}
            </p>
            <div className="flex-shrink-0 w-16">
              <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className={cn("h-full rounded-full", passed ? "bg-emerald-500" : pct > 0 ? "bg-amber-500" : "bg-red-500")}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
          {/* Primary detail */}
          <p className="text-sm text-slate-300 mb-1">{check.detail as string}</p>
          {/* Extra context lines */}
          {extras.map((e, i) => (
            <p key={i} className="text-xs text-slate-400 mt-0.5">{e}</p>
          ))}
        </div>
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
        <div className="flex-shrink-0 mt-0.5">
          {status === "excellent" && <Star className="h-7 w-7 text-emerald-400" />}
          {status === "good"      && <CheckCircle className="h-7 w-7 text-blue-400" />}
          {status === "caution"   && <AlertTriangle className="h-7 w-7 text-amber-400" />}
          {status === "danger"    && <XCircle className="h-7 w-7 text-red-400" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant={status} className="text-sm px-3 py-0.5">{overallCfg.label}</Badge>
            <span className="text-slate-400 text-sm">{assessment.title}</span>
          </div>
          <p className="text-white text-sm font-medium leading-relaxed">{verdict}</p>
        </div>
        {assessment.contract_value != null && (
          <div className="text-right hidden sm:block flex-shrink-0">
            <p className="text-xs text-slate-500 mb-0.5">Contract Value</p>
            <p className="text-base font-bold text-white">{formatCurrency(assessment.contract_value)}</p>
            {job_quality.expected_profit > 0 && (
              <>
                <p className="text-xs text-slate-500 mt-1 mb-0.5">Expected Profit</p>
                <p className="text-sm font-semibold text-emerald-400">{formatCurrency(job_quality.expected_profit)}</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Two Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Panel 1: Job Quality */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Job Quality Score
              </CardTitle>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className={cn("text-5xl font-bold tracking-tight", jqCfg.color)}>{job_quality.score}</span>
              <span className="text-slate-500 text-xl mb-1">/100</span>
              <span className={cn("ml-auto text-sm font-semibold px-3 py-1 rounded-lg", jqCfg.color, jqCfg.bg)}>
                {jqCfg.label}
              </span>
            </div>
            <ScoreGauge score={job_quality.score} barColor={jqCfg.bar} />
            <p className="text-xs text-slate-500 mt-2">
              How good are the contract terms — independent of your business
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <Separator className="mb-4" />
            <div className="space-y-2">
              {Object.entries(job_quality.breakdown).map(([key, item]) => (
                <BreakdownRow
                  key={key}
                  label={item.label}
                  value={item.value ?? "—"}
                  points={item.points}
                  max={item.max}
                />
              ))}
            </div>
            {job_quality.margin_percent !== undefined && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-slate-900 border border-slate-700 p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">Margin</p>
                  <p className={cn("text-base font-bold", job_quality.margin_percent >= 15 ? "text-emerald-400" : "text-amber-400")}>
                    {job_quality.margin_percent.toFixed(1)}%
                  </p>
                </div>
                <div className="rounded-lg bg-slate-900 border border-slate-700 p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">Profit</p>
                  <p className="text-base font-bold text-white">{formatCurrency(job_quality.expected_profit)}</p>
                </div>
                <div className="rounded-lg bg-slate-900 border border-slate-700 p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">Contract</p>
                  <p className="text-base font-bold text-white">{formatCurrency(job_quality.contract_value)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Panel 2: Fit Score */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-violet-400" />
              <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Fit Score — For Your Business
              </CardTitle>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className={cn("text-5xl font-bold tracking-tight", fitCfg.color)}>{fit.score}</span>
              <span className="text-slate-500 text-xl mb-1">/100</span>
              <span className={cn("ml-auto text-sm font-semibold px-3 py-1 rounded-lg", fitCfg.color, fitCfg.bg)}>
                {fitCfg.label}
              </span>
            </div>
            <ScoreGauge score={fit.score} barColor={fitCfg.bar} />
            <p className="text-xs text-slate-500 mt-2">
              Can your business cashflow, absorb risk, and profit from this job?
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <Separator className="mb-4" />
            <div className="space-y-3">
              {Object.values(fit.checks).map((check) => (
                <FitCheckRow key={check.label as string} check={check as FitCheck} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
