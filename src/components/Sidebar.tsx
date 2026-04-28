"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { deleteTask, getTasks, getMe, UserInfo } from "@/lib/api";
import { AITask } from "@/types/ai-task";
import Link from "next/link";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;
      if (!token) {
        setUser(null);
        setTasks([]);
        setLoading(false);
        return;
      }
      try {
        const [userData, tasksData] = await Promise.all([getMe(), getTasks()]);
        setUser(userData);
        setTasks(tasksData);
      } catch (error) {
        console.error("사이드바 데이터 로딩 실패:", error);
        setUser(null);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();

    window.addEventListener("flowmind:tasks-updated", loadInitialData);
    return () => {
      window.removeEventListener("flowmind:tasks-updated", loadInitialData);
    };
  }, [pathname]);

  const handleDeleteTask = async (taskId: string) => {
    const confirmed = window.confirm("이 분석 기록을 삭제할까요?");
    if (!confirmed) return;

    try {
      setDeletingTaskId(taskId);
      await deleteTask(taskId);
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId),
      );
      window.dispatchEvent(new Event("flowmind:tasks-updated"));

      if (pathname === `/tasks/${taskId}`) {
        router.replace("/dashboard");
      }
    } catch (error) {
      console.error("사이드바 분석 기록 삭제 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "분석 기록을 삭제하지 못했습니다.",
      );
    } finally {
      setDeletingTaskId(null);
    }
  };

  return (
    <aside
      className={`relative hidden h-full flex-shrink-0 flex-col border-r border-gray-100 bg-gray-50/50 text-black transition-all duration-300 md:flex ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <button
        type="button"
        onClick={() => setIsCollapsed((current) => !current)}
        className="absolute -right-3 top-6 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-lg leading-none text-gray-500 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
        aria-label={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
        title={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
      >
        {isCollapsed ? "›" : "‹"}
      </button>

      <div
        className={`p-4 h-full flex flex-col ${isCollapsed ? "items-center" : ""}`}
      >
        <Link
          href="/dashboard"
          className={`font-bold mb-8 p-2 hover:text-blue-600 transition-all block truncate ${
            isCollapsed ? "text-lg" : "text-xl"
          }`}
          aria-label="FlowMind AI 대시보드"
          title="FlowMind AI"
        >
          {isCollapsed ? "F" : "FlowMind AI ✨"}
        </Link>

        <Link
          href="/analyze"
          className={`mb-6 block rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 ${
            isCollapsed ? "w-9 text-center" : "w-full text-center"
          }`}
          aria-label="새 AI 분석"
          title="새 AI 분석"
        >
          {isCollapsed ? "+" : "새 AI 분석"}
        </Link>

        <nav className="flex-1 overflow-y-auto w-full">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
              최근 기록
            </h3>
          )}

          {loading ? (
            !isCollapsed && (
              <p className="text-sm text-gray-400 px-2 animate-pulse">
                기록 불러오는 중...
              </p>
            )
          ) : (
            <div className="space-y-1">
              {tasks && tasks.length > 0
                ? tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`group flex items-center gap-1 rounded transition-colors hover:bg-blue-50 ${
                        isCollapsed ? "justify-center" : ""
                      }`}
                    >
                      <Link
                        href={`/tasks/${task.id}`}
                        className={`min-w-0 flex-1 p-2 text-sm text-gray-700 hover:text-blue-700 truncate ${
                          isCollapsed ? "text-center" : ""
                        }`}
                        title={task.input_text}
                      >
                        <span
                          className={`font-medium text-blue-500 ${isCollapsed ? "" : "mr-2"}`}
                        >
                          [{task.task_type[0].toUpperCase()}]
                        </span>
                        {!isCollapsed && task.input_text}
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={deletingTaskId === task.id}
                        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-sm font-bold text-gray-300 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 ${
                          isCollapsed ? "" : "mr-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        }`}
                        aria-label={`${task.input_text} 삭제`}
                        title="삭제"
                      >
                        {deletingTaskId === task.id ? "..." : "×"}
                      </button>
                    </div>
                  ))
                : !isCollapsed && (
                    <p className="text-sm text-gray-400 px-2">
                      기록이 없습니다.
                    </p>
                  )}
            </div>
          )}
        </nav>

        <div className="border-t pt-4 mt-4 w-full">
          <div
            className={`px-2 py-1 text-xs text-gray-500 flex flex-col gap-1 ${isCollapsed ? "items-center" : ""}`}
          >
            {isCollapsed ? (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600"
                title={user ? user.email : "Guest"}
              >
                {user ? user.email[0].toUpperCase() : "G"}
              </div>
            ) : (
              <>
                <span className="text-gray-400">Logged in as:</span>
                <span className="font-medium text-blue-600 truncate">
                  {user ? user.email : "Guest"}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
