import { useNavigate } from "react-router-dom";
import { Briefcase, TrendingUp, Activity, PoundSterling, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAssessments } from "@/hooks/useAssessments";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import JobTable from "@/components/JobTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { AssessmentStatus } from "@/types";

const STATUS_ORDER: AssessmentStatus[] = ["excellent", "good", "caution", "danger"];
const STATUS_LABELS: Record<AssessmentStatus, string> = {
  excellent: "Excellent",
  good: "Good",
  caution: "Caution",
  danger: "Danger",
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: assessments = [], isLoading } = useAssessments();
  const navigate = useNavigate();

  const total = assessments.length;
  const avgCommercial = total > 0
    ? Math.round(assessments.reduce((s, a) => s + (a.commercial_score ?? 0), 0) / total)
    : 0;
  const avgExecution = total > 0
    ? Math.round(assessments.reduce((s, a) => s + (a.execution_score ?? 0), 0) / total)
    : 0;
  const avgContractValue = total > 0
    ? assessments.reduce((s, a) => s + (a.contract_value ?? 0), 0) / total
    : 0;

  const statusCounts = STATUS_ORDER.map((s) => ({
    status: s,
    count: assessments.filter((a) => a.status === s).length,
  }));

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {user?.name?.split(" ")[0]}
            </h1>
            <p className="text-slate-400 mt-1 text-sm">{user?.company_name} — Risk Assessment Dashboard</p>
          </div>
          <Button onClick={() => navigate("/assessment/new")} size="lg" className="gap-2 shadow-lg shadow-blue-900/30">
            <Plus className="h-4 w-4" />
            New Assessment
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Assessments"
            value={total}
            icon={Briefcase}
            iconColor="text-blue-400"
            iconBg="bg-blue-900/30"
          />
          <StatCard
            title="Avg Job Quality"
            value={total > 0 ? `${avgCommercial}/100` : "—"}
            sub="Contract terms score"
            icon={TrendingUp}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-900/30"
          />
          <StatCard
            title="Avg Fit Score"
            value={total > 0 ? `${avgExecution}/100` : "—"}
            sub="How well jobs suit your business"
            icon={Activity}
            iconColor="text-violet-400"
            iconBg="bg-violet-900/30"
          />
          <StatCard
            title="Avg Contract Value"
            value={total > 0 ? formatCurrency(avgContractValue) : "—"}
            icon={PoundSterling}
            iconColor="text-amber-400"
            iconBg="bg-amber-900/30"
          />
        </div>

        {/* Status breakdown */}
        {total > 0 && (
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {statusCounts.map(({ status, count }) => (
                  <div key={status} className="flex items-center gap-2">
                    <Badge variant={status as AssessmentStatus}>{STATUS_LABELS[status]}</Badge>
                    <span className="text-sm font-semibold text-white">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assessments table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Assessment History</CardTitle>
            {total > 0 && (
              <span className="text-xs text-slate-500">{total} record{total !== 1 ? "s" : ""}</span>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
                Loading assessments…
              </div>
            ) : (
              <JobTable assessments={assessments} />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
