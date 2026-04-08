// src/lib/api.ts
import { AITask, CreateTaskPayload } from "@/types/ai-task";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // 1. LocalStorage에서 토큰 가져오기
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // 2. 토큰이 있으면 Authorization 헤더에 추가 💡 (핵심!)
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(url, defaultOptions);

  // 3. 401 Unauthorized 처리 (토큰 만료 등)
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      //window.location.href = "/login";
    }
    throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
  }

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "알 수 없는 에러" }));
    throw new Error(errorData.detail || "API 요청에 실패했습니다.");
  }

  return response.json();
}

// API 함수들은 그대로 유지 (내부적으로 수정된 apiClient를 사용하게 됨)
export const getTasks = () => apiClient<AITask[]>("/tasks/");
export const getTaskDetail = (id: string) => apiClient<AITask>(`/tasks/${id}`);
export const createAITask = (payload: CreateTaskPayload) =>
  apiClient<AITask>("/tasks/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const login = (payload: any) =>
  apiClient<{ access_token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const signup = (payload: any) =>
  apiClient<any>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export interface UserInfo {
  id: string;
  email: string;
  // 필요하다면 name 등 추가
}

export const getMe = () => apiClient<UserInfo>("/auth/me"); // 백엔드 경로에 맞게 수정
