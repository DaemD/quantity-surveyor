import { apiClient } from "./client";
import type { QuestionsConfig } from "@/types";

export async function getQuestions(): Promise<QuestionsConfig> {
  const res = await apiClient.get<QuestionsConfig>("/questions");
  return res.data;
}
