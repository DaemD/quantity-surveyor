import { useNavigate } from "react-router-dom";
import { Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AssessmentListItem, AssessmentStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusConfig: Record<AssessmentStatus, { label: string; variant: AssessmentStatus }> = {
  excellent: { label: "Excellent", variant: "excellent" },
  good: { label: "Good", variant: "good" },
  caution: { label: "Caution", variant: "caution" },
  danger: { label: "Danger", variant: "danger" },
};

interface JobTableProps {
  assessments: AssessmentListItem[];
}

export default function JobTable({ assessments }: JobTableProps) {
  const navigate = useNavigate();

  if (assessments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="h-12 w-12 text-slate-600 mb-3" />
        <p className="text-slate-400 font-medium">No assessments yet</p>
        <p className="text-slate-500 text-sm mt-1">Run your first risk assessment to see results here</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Job Title</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Contract Value</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Job Quality</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Fit Score</th>
            <th className="text-center py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
            <th className="py-3 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {assessments.map((a) => {
            const cfg = statusConfig[a.status] ?? statusConfig.good;
            return (
              <tr key={a.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="py-3.5 px-4 font-medium text-white">{a.title}</td>
                <td className="py-3.5 px-4 text-right text-slate-300">{formatCurrency(a.contract_value)}</td>
                <td className="py-3.5 px-4 text-right">
                  <span className={a.commercial_score != null && a.commercial_score >= 55 ? "text-emerald-400" : "text-amber-400"}>
                    {a.commercial_score != null ? `${a.commercial_score}/100` : "—"}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className={a.execution_score != null && a.execution_score >= 55 ? "text-emerald-400" : "text-amber-400"}>
                    {a.execution_score != null ? `${a.execution_score}/100` : "—"}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                </td>
                <td className="py-3.5 px-4 text-right text-slate-400 text-xs">{formatDate(a.created_at)}</td>
                <td className="py-3.5 px-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/assessment/${a.id}`)}
                    className="gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
