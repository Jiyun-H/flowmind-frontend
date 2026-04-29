"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTask, getMe, getTasks, UserInfo } from "@/lib/api";
import {
  createProject,
  FlowMindProject,
  getProjects,
  removeTaskFromProjects,
} from "@/lib/projects";
import { AITask } from "@/types/ai-task";

const taskTypeLabel: Record<AITask["task_type"], string> = {
  structure: "SDLC 구조화",
  summarize: "회의록 요약",
  suggest: "액션 아이템 제안",
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [projects, setProjects] = useState<FlowMindProject[]>([]);
  const [projectName, setProjectName] = useState("");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        setLoading(true);
        const [userData, tasksData] = await Promise.all([getMe(), getTasks()]);
        setUser(userData);
        setTasks(tasksData);
        setProjects(getProjects());
      } catch (error) {
        console.error("대시보드 로딩 실패:", error);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();

    const syncProjects = () => setProjects(getProjects());
    window.addEventListener("flowmind:projects-updated", syncProjects);
    return () => {
      window.removeEventListener("flowmind:projects-updated", syncProjects);
    };
  }, [router]);

  const completedCount = useMemo(
    () => tasks.filter((task) => task.status === "completed").length,
    [tasks],
  );
  const latestTasks = tasks.slice(0, 5);
  const latestProjects = projects.slice(0, 5);

  const handleCreateProject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = projectName.trim();
    if (!trimmedName) return;

    const project = createProject(trimmedName, user?.email);
    setProjects(getProjects());
    setProjectName("");
    setShowProjectForm(false);
    router.push(`/projects/${project.id}`);
  };

  const handleDeleteTask = async (taskId: string) => {
    const confirmed = window.confirm("이 분석 기록을 삭제할까요?");
    if (!confirmed) return;

    try {
      setDeletingTaskId(taskId);
      await deleteTask(taskId);
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId),
      );
      removeTaskFromProjects(taskId);
      setProjects(getProjects());
      window.dispatchEvent(new Event("flowmind:tasks-updated"));
    } catch (error) {
      console.error("분석 기록 삭제 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "분석 기록을 삭제하지 못했습니다.",
      );
    } finally {
      setDeletingTaskId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-gray-500 animate-pulse">
        대시보드를 불러오는 중...
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-8 text-black">
      <section className="mb-8 flex flex-col gap-4 border-b border-gray-100 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-blue-600">Dashboard</p>
          <h1 className="text-3xl font-bold text-gray-950">
            {user?.email ?? "Guest"}님의 작업 공간
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowProjectForm((current) => !current)}
          className="inline-flex items-center justify-center rounded bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          새 프로젝트 시작하기
        </button>
      </section>

      {showProjectForm && (
        <form
          onSubmit={handleCreateProject}
          className="mb-8 flex flex-col gap-3 rounded border border-gray-100 bg-white p-4 shadow-sm sm:flex-row"
        >
          <input
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            className="min-w-0 flex-1 rounded border border-gray-200 px-3 py-2 text-sm text-black outline-none transition focus:border-blue-300"
            placeholder="프로젝트 폴더 이름"
            autoFocus
          />
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            만들기
          </button>
        </form>
      )}

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">전체 기록</p>
          <p className="mt-2 text-3xl font-bold text-gray-950">
            {tasks.length}
          </p>
        </div>
        <div className="rounded border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">완료된 분석</p>
          <p className="mt-2 text-3xl font-bold text-gray-950">
            {completedCount}
          </p>
        </div>
        <div className="rounded border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">최근 작업</p>
          <p className="mt-2 text-3xl font-bold text-gray-950">
            {latestTasks.length > 0
              ? new Date(latestTasks[0].created_at).toLocaleDateString("ko-KR")
              : "-"}
          </p>
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">최근 프로젝트</h2>
          <button
            type="button"
            onClick={() => setShowProjectForm((current) => !current)}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            프로젝트 만들기
          </button>
        </div>

        {latestProjects.length > 0 ? (
          <div className="divide-y divide-gray-100 rounded border border-gray-100 bg-white shadow-sm">
            {latestProjects.map((project) => {
              const projectTaskCount = project.taskIds.length;
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block p-4 transition hover:bg-blue-50"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                      프로젝트 폴더
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(project.updatedAt).toLocaleString("ko-KR")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {project.name}
                    </p>
                    <span className="flex-shrink-0 text-xs text-gray-500">
                      분석 {projectTaskCount}개
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
            <p className="mb-4 text-gray-500">
              아직 프로젝트 폴더가 없습니다.
            </p>
            <button
              type="button"
              onClick={() => setShowProjectForm(true)}
              className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              첫 프로젝트 시작
            </button>
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">최근 기록</h2>
          <Link
            href="/analyze"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            분석 만들기
          </Link>
        </div>

        {latestTasks.length > 0 ? (
          <div className="divide-y divide-gray-100 rounded border border-gray-100 bg-white shadow-sm">
            {latestTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-4">
                <Link
                  href={`/tasks/${task.id}`}
                  className="min-w-0 flex-1 transition hover:text-blue-700"
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
                <button
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  disabled={deletingTaskId === task.id}
                  className="rounded border border-red-100 px-3 py-2 text-sm font-semibold text-red-500 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingTaskId === task.id ? "삭제 중" : "삭제"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
            <p className="mb-4 text-gray-500">아직 분석 기록이 없습니다.</p>
            <Link
              href="/analyze"
              className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              첫 분석 시작
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
