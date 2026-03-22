import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAssessments, getAssessment, createAssessment } from "@/api/assessments";
import type { CreateAssessmentPayload } from "@/types";

export function useAssessments() {
  return useQuery({
    queryKey: ["assessments"],
    queryFn: getAssessments,
  });
}

export function useAssessment(id: string) {
  return useQuery({
    queryKey: ["assessment", id],
    queryFn: () => getAssessment(id),
    enabled: !!id,
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
