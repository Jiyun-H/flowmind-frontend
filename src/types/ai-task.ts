// src/types/ai-task.ts
export type TaskType = "summarize" | "structure" | "suggest";
export type TaskStatus = "pending" | "completed" | "failed";

export interface AITask {
  id: string;
  user_id: string;
  task_type: TaskType;
  input_text: string;
  result_json: {
    content: string;
  } | null;
  status: TaskStatus;
  model_used: string | null;
  created_at: string;
}

export interface CreateTaskPayload {
  task_type: TaskType;
  input_text: string;
}
