import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CheckCircle, HardHat, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { getQuestions } from "@/api/questions";
import { useCreateAssessment } from "@/hooks/useAssessments";
import type { Assessment, FormField, FormSection } from "@/types";
import { cn } from "@/lib/utils";
import ResultsDisplay from "./ResultsDisplay";

type Step = "intro" | "overview" | "commercial" | "risk" | "results";
const STEPS: Step[] = ["intro", "overview", "commercial", "risk", "results"];
const STEP_LABELS = ["Start", "Job Overview", "Commercial Terms", "Risk Factors", "Results"];

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-1 flex-shrink-0">
          <div className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all",
            i < idx ? "bg-emerald-600 text-white" :
            i === idx ? "bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950" :
            "bg-slate-800 text-slate-500"
          )}>
            {i < idx ? <CheckCircle className="h-4 w-4" /> : i + 1}
          </div>
          <span className={cn("text-xs hidden sm:block", i === idx ? "text-white font-medium" : "text-slate-500")}>
            {STEP_LABELS[i]}
          </span>
          {i < STEPS.length - 1 && <div className="h-px w-4 bg-slate-700 mx-1" />}
        </div>
      ))}
    </div>
  );
}

function FieldInput({ field, value, onChange }: {
  field: FormField;
  value: string | number;
  onChange: (v: string | number) => void;
}) {
  if (field.type === "select") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={field.id}>
          {field.label}
          {field.help && <span className="text-slate-500 text-xs ml-2">— {field.help}</span>}
        </Label>
        <select
          id={field.id}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <option value="">Select…</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={field.id}>{field.label}</Label>
        <textarea
          id={field.id}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="flex w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
        />
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={field.id}>
          {field.label}
          {field.help && <span className="text-slate-500 text-xs ml-2">— {field.help}</span>}
        </Label>
        <div className="flex">
          {field.prefix && (
            <span className="flex items-center rounded-l-lg border border-r-0 border-slate-600 bg-slate-800 px-3 text-sm text-slate-400">{field.prefix}</span>
          )}
          <Input
            id={field.id}
            type="number"
            min={0}
            step="any"
            value={value === 0 ? "" : String(value)}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className={cn(field.prefix ? "rounded-l-none" : "", field.suffix ? "rounded-r-none" : "")}
          />
          {field.suffix && (
            <span className="flex items-center rounded-r-lg border border-l-0 border-slate-600 bg-slate-800 px-3 text-sm text-slate-400">{field.suffix}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.id}>{field.label}</Label>
      <Input
        id={field.id}
        type={field.type}
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
      />
    </div>
  );
}

function SectionForm({ section, answers, onChange }: {
  section: FormSection;
  answers: Record<string, string | number>;
  onChange: (id: string, v: string | number) => void;
}) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">{section.title}</h2>
        <p className="text-slate-400 text-sm mt-1">{section.description}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {section.fields.map((field) => (
          <div key={field.id} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
            <FieldInput
              field={field}
              value={answers[field.id] ?? ""}
              onChange={(v) => onChange(field.id, v)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AssessmentWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("intro");
  const [title, setTitle] = useState("");
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [savedAssessment, setSavedAssessment] = useState<Assessment | null>(null);

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: getQuestions,
  });

  const createMutation = useCreateAssessment();

  const setAnswer = (id: string, v: string | number) =>
    setAnswers((prev) => ({ ...prev, [id]: v }));

  const getSection = (id: string) => questions?.sections.find((s) => s.id === id);

  const handleSubmit = async () => {
    const result = await createMutation.mutateAsync({
      title: title || "Untitled Assessment",
      answers,
    });
    setSavedAssessment(result);
  };

  if (questionsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 text-slate-400 gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />Loading…
        </div>
      </Layout>
    );
  }

  // Results step — show saved assessment results
  if (step === "results" && savedAssessment?.results) {
    return (
      <Layout>
        <div className="p-8 max-w-5xl mx-auto">
          <StepIndicator current="results" />
          <ResultsDisplay assessment={savedAssessment} />
          <div className="mt-8 flex gap-3">
            <Button variant="outline" onClick={() => navigate("/")}>Back to Dashboard</Button>
            <Button onClick={() => navigate(`/assessment/${savedAssessment.id}`)}>View Full Report</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 max-w-3xl mx-auto">
        <StepIndicator current={step} />

        {/* ── Intro ─────────────────────────────────────────────────────── */}
        {step === "intro" && (
          <div className="flex flex-col items-center text-center py-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600/20 border border-blue-600/40 mb-6">
              <HardHat className="h-10 w-10 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">New Deal Assessment</h2>
            <p className="text-slate-400 max-w-lg mb-8 leading-relaxed">
              Answer questions about the contract terms and financials. We'll give you two scores:
              how good the deal is in general, and how good it is for your specific business.
            </p>
            <div className="flex gap-6 mb-8 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">3</p>
                <p className="text-slate-500">sections</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">~5</p>
                <p className="text-slate-500">minutes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">2</p>
                <p className="text-slate-500">scores</p>
              </div>
            </div>
            <div className="w-full max-w-sm space-y-1.5 mb-6">
              <Label htmlFor="title">Job / Deal Name</Label>
              <Input
                id="title" value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Office Refurb — Manchester"
              />
            </div>
            <Button size="lg" className="gap-2" onClick={() => setStep("overview")} disabled={!title.trim()}>
              Start Assessment <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* ── Overview ──────────────────────────────────────────────────── */}
        {step === "overview" && getSection("overview") && (
          <div>
            <SectionForm
              section={getSection("overview")!}
              answers={answers}
              onChange={setAnswer}
            />
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setStep("intro")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />Back
              </Button>
              <Button onClick={() => setStep("commercial")} className="gap-2">
                Next: Commercial Terms <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Commercial Terms ──────────────────────────────────────────── */}
        {step === "commercial" && getSection("commercial_terms") && (
          <div>
            <SectionForm
              section={getSection("commercial_terms")!}
              answers={answers}
              onChange={setAnswer}
            />
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setStep("overview")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />Back
              </Button>
              <Button onClick={() => setStep("risk")} className="gap-2">
                Next: Risk Factors <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Risk Factors ──────────────────────────────────────────────── */}
        {step === "risk" && getSection("risk_factors") && (
          <div>
            <SectionForm
              section={getSection("risk_factors")!}
              answers={answers}
              onChange={setAnswer}
            />
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setStep("commercial")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />Back
              </Button>
              <Button
                size="lg"
                className="gap-2"
                onClick={async () => { setStep("results"); await handleSubmit(); }}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Analysing…</>
                  : <>Get My Scores <ArrowRight className="h-4 w-4" /></>}
              </Button>
            </div>
          </div>
        )}

        {/* ── Results loading / error ───────────────────────────────────── */}
        {step === "results" && createMutation.isPending && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
            <p className="text-slate-400">Scoring your assessment…</p>
          </div>
        )}
        {step === "results" && createMutation.isError && (
          <Card className="mt-4 border-red-700">
            <CardContent className="p-6">
              <p className="text-red-400 font-medium mb-3">Failed to save assessment.</p>
              <Button variant="outline" onClick={() => setStep("risk")}>
                <ArrowLeft className="h-4 w-4 mr-2" />Go Back
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
