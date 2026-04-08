"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getTasks, getMe, UserInfo } from "@/lib/api";
import { AITask } from "@/types/ai-task";
import Link from "next/link";

export default function Sidebar() {
  const pathname = usePathname();
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      // 로딩 상태 시작
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
        // 유저 정보와 작업 목록을 병렬로 호출
        const [userData, tasksData] = await Promise.all([getMe(), getTasks()]);

        setUser(userData);
        setTasks(tasksData);
      } catch (error) {
        console.error("사이드바 데이터 로딩 실패:", error);
        // 에러 시 상태 초기화
        setUser(null);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [pathname]); // 💡 경로가 바뀔 때마다(로그인 후 이동 포함) 다시 실행

  return (
    <div className="p-4 h-full flex flex-col text-black">
      <Link
        href="/"
        className="text-xl font-bold mb-8 p-2 hover:text-blue-600 transition-colors block"
      >
        FlowMind AI ✨
      </Link>

      <nav className="flex-1 overflow-y-auto">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
          최근 기록
        </h3>

        {loading ? (
          <p className="text-sm text-gray-400 px-2 animate-pulse">
            기록 불러오는 중...
          </p>
        ) : (
          <div className="space-y-1">
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="block p-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors truncate"
                >
                  <span className="font-medium mr-2 text-blue-500">
                    [{task.task_type}]
                  </span>
                  {task.input_text}
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-400 px-2">기록이 없습니다.</p>
            )}
          </div>
        )}
      </nav>

      <div className="border-t pt-4 mt-4">
        <div className="px-2 py-1 text-xs text-gray-500 flex flex-col gap-1">
          <span className="text-gray-400">Logged in as:</span>
          <span className="font-medium text-blue-600 truncate">
            {user ? user.email : "Guest"}
          </span>
        </div>
      </div>
    </div>
  );
}
