"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createAITask, getTasks } from "@/lib/api";
import {
  addTaskToProject,
  FlowMindProject,
  getProject,
  getProjectTasks,
} from "@/lib/projects";
import { AITask, TaskType } from "@/types/ai-task";

const taskTypeLabel: Record<TaskType, string> = {
  structure: "SDLC 구조화",
  summarize: "회의록 요약",
  suggest: "액션 아이템 제안",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [project, setProject] = useState<FlowMindProject | null>(null);
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [input, setInput] = useState("");
  const [type, setType] = useState<TaskType>("structure");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function loadProject() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.replace("/login");
        return;
      }

      if (!projectId) return;

      const projectData = getProject(projectId);
      if (!projectData) {
        router.replace("/dashboard");
        return;
      }

      try {
        setLoading(true);
        setProject(projectData);
        setTasks(await getTasks());
      } catch (error) {
        console.error("프로젝트 로딩 실패:", error);
        alert("프로젝트를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId, router]);

  const projectTasks = useMemo(() => {
    if (!project) return [];
    return getProjectTasks(project, tasks);
  }, [project, tasks]);

  const handleCreateAnalysis = async () => {
    if (!project || !input.trim()) return alert("분석할 내용을 입력해주세요.");

    try {
      setCreating(true);
      const task = await createAITask({
        task_type: type,
        input_text: input,
      });

      addTaskToProject(project.id, task.id);
      setProject(getProject(project.id));
      setTasks((currentTasks) => [task, ...currentTasks]);
      setInput("");
      window.dispatchEvent(new Event("flowmind:tasks-updated"));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "AI 분석을 생성하지 못했습니다.";

      if (message.includes("인증")) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        router.push("/login");
      } else {
        alert(message);
      }
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-gray-500 animate-pulse">
        프로젝트를 불러오는 중...
      </div>
    );
  }

  if (!project) {
    return <div className="p-8 text-red-500">프로젝트를 찾을 수 없습니다.</div>;
  }

  return (
    <main className="mx-auto max-w-5xl p-8 text-black">
      <section className="mb-8 border-b border-gray-100 pb-8">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          대시보드로 돌아가기
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-blue-600">
              Project Folder
            </p>
            <h1 className="text-3xl font-bold text-gray-950">
              {project.name}
            </h1>
          </div>
          <div className="text-sm text-gray-500">
            분석 {projectTasks.length}개
          </div>
        </div>
      </section>

      <section className="mb-8 rounded border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          프로젝트 안에서 AI 분석 만들기
        </h2>
        <div className="space-y-4">
          <select
            value={type}
            onChange={(event) => setType(event.target.value as TaskType)}
            className="w-full rounded border border-gray-200 bg-white p-2 text-black"
          >
            <option value="structure">SDLC 구조화</option>
            <option value="summarize">회의록 요약</option>
            <option value="suggest">액션 아이템 제안</option>
          </select>

          <textarea
            className="h-36 w-full rounded border border-gray-200 bg-white p-4 text-black"
            placeholder="이 프로젝트와 관련된 아이디어, 회의록, 요구사항을 입력하세요..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />

          <button
            type="button"
            onClick={handleCreateAnalysis}
            disabled={creating}
            className="w-full rounded bg-blue-600 p-3 font-bold text-white transition hover:bg-blue-700 disabled:bg-gray-400"
          >
            {creating ? "AI가 분석 중입니다..." : "프로젝트에 AI 분석 추가"}
          </button>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">프로젝트 분석 기록</h2>
        </div>

        {projectTasks.length > 0 ? (
          <div className="divide-y divide-gray-100 rounded border border-gray-100 bg-white shadow-sm">
            {projectTasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="block p-4 transition hover:bg-blue-50"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                    {taskTypeLabel[task.task_type]}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(task.created_at).toLocaleString("ko-KR")}
                  </span>
                </div>
                <p className="truncate text-sm text-gray-700">
                  {task.input_text}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-gray-500">
              이 프로젝트에는 아직 AI 분석이 없습니다.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
