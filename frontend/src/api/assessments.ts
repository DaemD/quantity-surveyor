import { apiClient } from "./client";
import type { Assessment, AssessmentListItem, CreateAssessmentPayload } from "@/types";

export async function getAssessments(): Promise<AssessmentListItem[]> {
  const res = await apiClient.get<AssessmentListItem[]>("/assessments");
  return res.data;
}

export async function getAssessment(id: string): Promise<Assessment> {
  const res = await apiClient.get<Assessment>(`/assessments/${id}`);
  return res.data;
}

export async function createAssessment(data: CreateAssessmentPayload): Promise<Assessment> {
  const res = await apiClient.post<Assessment>("/assessments", data);
  return res.data;
}
