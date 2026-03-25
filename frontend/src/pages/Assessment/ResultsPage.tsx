import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAssessment } from "@/hooks/useAssessments";
import { formatDate } from "@/lib/utils";
import ResultsDisplay from "./ResultsDisplay";

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
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-slate-400 text-sm">{assessment.title}</span>
          <span className="text-slate-600 text-xs ml-auto">{formatDate(assessment.created_at)}</span>
        </div>
        <ResultsDisplay assessment={assessment} />
      </div>
    </Layout>
  );
}
