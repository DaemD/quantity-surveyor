import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAssessments, getAssessment, createAssessment } from "@/api/assessments";
import type { CreateAssessmentPayload } from "@/types";

export function useAssessments() {
  return useQuery({
    queryKey: ["assessments"],
    queryFn: getAssessments,
  });
}

export function useAssessment(id: string, options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && !!id;
  return useQuery({
    queryKey: ["assessment", id],
    queryFn: () => getAssessment(id),
    enabled,
    refetchInterval: (query) => {
      const d = query.state.data;
      if (!d?.results) return false;
      const ex = d.explanations;
      if (!ex || typeof ex !== "object") return false;
      if ("disabled" in ex && ex.disabled) return false;
      if ("error" in ex && ex.error) return false;
      if (typeof ex.job_quality_plain === "string" && typeof ex.fit_plain === "string") return false;
      if (ex.status === "pending") return 2500;
      return false;
    },
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAssessmentPayload) => createAssessment(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
}
