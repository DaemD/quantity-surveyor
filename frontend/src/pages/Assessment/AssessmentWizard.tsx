import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CheckCircle, HardHat, Loader2, Save } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getQuestions } from "@/api/questions";
import { useCreateAssessment } from "@/hooks/useAssessments";
import ResultsContent from "./ResultsPage";
import type { Assessment, AssessmentResults, QuestionOption, QuestionSection } from "@/types";
import { cn } from "@/lib/utils";

type Step = "intro" | "commercial" | "execution" | "results";

const STEPS: Step[] = ["intro", "commercial", "execution", "results"];
const STEP_LABELS = ["Intro", "Commercial Risk", "Financial Inputs", "Results"];

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all",
              i < idx ? "bg-emerald-600 text-white" :
              i === idx ? "bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950" :
              "bg-slate-800 text-slate-500"
            )}
          >
            {i < idx ? <CheckCircle className="h-4 w-4" /> : i + 1}
          </div>
          <span className={cn("text-sm hidden sm:block", i === idx ? "text-white font-medium" : "text-slate-500")}>
            {STEP_LABELS[i]}
          </span>
          {i < STEPS.length - 1 && <div className="h-px w-6 bg-slate-700 mx-1" />}
        </div>
      ))}
    </div>
  );
}

function RadioCard({ option, selected, onSelect }: { option: QuestionOption; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-lg border px-4 py-3 text-sm transition-all duration-150",
        selected
          ? "border-blue-500 bg-blue-900/30 text-white"
          : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:bg-slate-800"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "h-4 w-4 rounded-full border-2 flex-shrink-0 transition-all",
          selected ? "border-blue-500 bg-blue-500" : "border-slate-500"
        )}>
          {selected && <div className="h-full w-full rounded-full bg-white scale-50" />}
        </div>
        <span>{option.label}</span>
        <span className={cn(
          "ml-auto text-xs font-semibold flex-shrink-0",
          option.value > 0 ? "text-emerald-400" : option.value < 0 ? "text-red-400" : "text-slate-500"
        )}>
          {option.value > 0 ? `+${option.value}` : option.value}
        </span>
      </div>
    </button>
  );
}

function CommercialStep({
  section,
  answers,
  onChange,
}: {
  section: QuestionSection;
  answers: Record<string, number>;
  onChange: (id: string, value: number) => void;
}) {
  const score = Object.values(answers).reduce((s, v) => s + v, 0);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">{section.title}</h2>
        <p className="text-slate-400 text-sm mt-1">{section.description}</p>
      </div>

      <div className="space-y-6">
        {section.questions.map((q) => (
          <div key={q.id}>
            <div className="flex items-start gap-2 mb-2">
              <Label className="text-slate-200 font-medium">{q.label}</Label>
              {q.help && <span className="text-xs text-slate-500 mt-0.5">— {q.help}</span>}
            </div>
            <div className="space-y-2">
              {q.options?.map((opt) => (
                <RadioCard
                  key={opt.value}
                  option={opt}
                  selected={answers[q.id] === opt.value}
                  onSelect={() => onChange(q.id, opt.value)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Running score */}
      <div className="sticky bottom-0 mt-8 rounded-xl border border-slate-700 bg-slate-900/90 backdrop-blur-sm p-4 flex items-center justify-between">
        <span className="text-slate-400 text-sm font-medium">Running Score</span>
        <div className="flex items-center gap-3">
          <div className="h-2 w-32 rounded-full bg-slate-700 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", score >= 0 ? "bg-emerald-500" : "bg-red-500")}
              style={{ width: `${((score + 20) / 40) * 100}%` }}
            />
          </div>
          <span className={cn("text-lg font-bold", score >= 0 ? "text-emerald-400" : "text-red-400")}>
            {score > 0 ? "+" : ""}{score} / 20
          </span>
        </div>
      </div>
    </div>
  );
}

function NumericInput({
  id,
  label,
  prefix,
  suffix,
  value,
  onChange,
}: {
  id: string;
  label: string;
  prefix?: string;
  suffix?: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex">
        {prefix && (
          <span className="flex items-center rounded-l-lg border border-r-0 border-slate-600 bg-slate-800 px-3 text-sm text-slate-400">
            {prefix}
          </span>
        )}
        <Input
          id={id}
          type="number"
          min={0}
          value={value || ""}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={cn(prefix ? "rounded-l-none" : "", suffix ? "rounded-r-none" : "")}
        />
        {suffix && (
          <span className="flex items-center rounded-r-lg border border-l-0 border-slate-600 bg-slate-800 px-3 text-sm text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function ExecutionStep({
  section,
  answers,
  onChange,
}: {
  section: QuestionSection;
  answers: Record<string, number>;
  onChange: (id: string, value: number) => void;
}) {
  const groups: Record<string, typeof section.questions> = {};
  for (const q of section.questions) {
    const g = q.group ?? "other";
    if (!groups[g]) groups[g] = [];
    groups[g].push(q);
  }

  const groupLabels: Record<string, string> = {};
  for (const q of section.questions) {
    if (q.group && q.groupLabel) groupLabels[q.group] = q.groupLabel;
  }

  const companyQs = groups["company"] ?? [];
  const jobQs = groups["job"] ?? [];
  const worstQs = groups["worstcase"] ?? [];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">{section.title}</h2>
        <p className="text-slate-400 text-sm mt-1">{section.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Company profile */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{groupLabels["company"] ?? "Company Profile"}</p>
          <div className="space-y-4">
            {companyQs.map((q) => (
              <NumericInput
                key={q.id}
                id={q.id}
                label={q.label}
                prefix={q.prefix}
                suffix={q.suffix}
                value={answers[q.id] ?? q.default ?? 0}
                onChange={(v) => onChange(q.id, v)}
              />
            ))}
          </div>
        </div>

        {/* Job details */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{groupLabels["job"] ?? "This Job"}</p>
          <div className="space-y-4">
            {jobQs.map((q) => (
              <NumericInput
                key={q.id}
                id={q.id}
                label={q.label}
                prefix={q.prefix}
                suffix={q.suffix}
                value={answers[q.id] ?? q.default ?? 0}
                onChange={(v) => onChange(q.id, v)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Worst case */}
      {worstQs.length > 0 && (
        <div className="rounded-xl border border-amber-700/40 bg-amber-900/10 p-5">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">
            {groupLabels["worstcase"] ?? "Worst-Case Scenario"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {worstQs.map((q) => (
              <NumericInput
                key={q.id}
                id={q.id}
                label={q.label}
                prefix={q.prefix}
                suffix={q.suffix}
                value={answers[q.id] ?? q.default ?? 0}
                onChange={(v) => onChange(q.id, v)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssessmentWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("intro");
  const [title, setTitle] = useState("");
  const [commercialAnswers, setCommercialAnswers] = useState<Record<string, number>>({});
  const [executionAnswers, setExecutionAnswers] = useState<Record<string, number>>({});
  const [savedAssessment, setSavedAssessment] = useState<Assessment | null>(null);

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: getQuestions,
  });

  const createMutation = useCreateAssessment();

  const commercialSection = questions?.sections.find((s) => s.id === "commercial");
  const executionSection = questions?.sections.find((s) => s.id === "execution");

  // Pre-fill execution defaults from config
  const getExecutionAnswers = () => {
    if (!executionSection) return executionAnswers;
    const defaults: Record<string, number> = {};
    for (const q of executionSection.questions) {
      defaults[q.id] = executionAnswers[q.id] ?? q.default ?? 0;
    }
    return defaults;
  };

  const canProceedCommercial = commercialSection
    ? commercialSection.questions.every((q) => commercialAnswers[q.id] !== undefined)
    : false;

  const handleSave = async () => {
    const execAns = getExecutionAnswers();
    const result = await createMutation.mutateAsync({
      title: title || "Untitled Assessment",
      answers: { commercial: commercialAnswers, execution: execAns },
    });
    setSavedAssessment(result);
  };

  if (questionsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 text-slate-400 gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading questions…
        </div>
      </Layout>
    );
  }

  if (savedAssessment?.results && step === "results") {
    return (
      <Layout>
        <div className="p-8 max-w-4xl mx-auto">
          <StepIndicator current="results" />
          <ResultsContent
            results={savedAssessment.results as AssessmentResults}
            title={savedAssessment.title}
            createdAt={savedAssessment.created_at}
          />
          <div className="mt-8 flex gap-3">
            <Button onClick={() => navigate("/")} variant="outline">
              Back to Dashboard
            </Button>
            <Button onClick={() => navigate(`/assessment/${savedAssessment.id}`)}>
              View Full Report
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 max-w-3xl mx-auto">
        <StepIndicator current={step} />

        {step === "intro" && (
          <div className="flex flex-col items-center text-center py-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600/20 border border-blue-600/40 mb-6">
              <HardHat className="h-10 w-10 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Pre-Contract Risk Assessment</h2>
            <p className="text-slate-400 max-w-lg mb-8 leading-relaxed">
              This tool analyses the commercial terms and your financial position to give you a clear risk rating before you commit to a contract.
              It takes about 3 minutes to complete.
            </p>
            <div className="flex gap-3 flex-wrap justify-center mb-8">
              <Badge variant="good">Commercial Risk (10 questions)</Badge>
              <Badge variant="good">Financial Reality (9 inputs)</Badge>
              <Badge variant="excellent">Instant AI Risk Score</Badge>
            </div>
            <div className="w-full max-w-sm space-y-1.5 mb-6">
              <Label htmlFor="title">Job / Contract Name</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Office Refurb — Manchester"
              />
            </div>
            <Button size="lg" className="gap-2" onClick={() => setStep("commercial")} disabled={!title.trim()}>
              Start Assessment
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {step === "commercial" && commercialSection && (
          <div>
            <CommercialStep
              section={commercialSection}
              answers={commercialAnswers}
              onChange={(id, value) => setCommercialAnswers((prev) => ({ ...prev, [id]: value }))}
            />
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setStep("intro")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={() => setStep("execution")}
                disabled={!canProceedCommercial}
                className="gap-2"
              >
                Next: Financial Inputs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            {!canProceedCommercial && (
              <p className="text-xs text-slate-500 text-right mt-2">
                Answer all {commercialSection.questions.length} questions to continue
              </p>
            )}
          </div>
        )}

        {step === "execution" && executionSection && (
          <div>
            <ExecutionStep
              section={executionSection}
              answers={getExecutionAnswers()}
              onChange={(id, value) => setExecutionAnswers((prev) => ({ ...prev, [id]: value }))}
            />
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setStep("commercial")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={async () => {
                  setStep("results");
                  await handleSave();
                }}
                disabled={createMutation.isPending}
                className="gap-2"
                size="lg"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Calculate & Save Results
              </Button>
            </div>
          </div>
        )}

        {step === "results" && createMutation.isPending && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
            <p className="text-slate-400">Analysing your assessment…</p>
          </div>
        )}

        {step === "results" && createMutation.isError && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-red-400">Error</CardTitle>
              <CardDescription>Failed to save assessment. Please try again.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setStep("execution")} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
