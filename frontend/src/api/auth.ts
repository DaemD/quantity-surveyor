import { apiClient } from "./client";
import type { AuthResponse, LoginPayload, RegisterPayload, User } from "@/types";

export async function login(data: LoginPayload): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>("/auth/login", data);
  return res.data;
}

export async function register(data: RegisterPayload): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>("/auth/register", data);
  return res.data;
}

export async function getMe(): Promise<User> {
  const res = await apiClient.get<User>("/auth/me");
  return res.data;
}
