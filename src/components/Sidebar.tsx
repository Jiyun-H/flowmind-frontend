"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getTasks, getMe, UserInfo } from "@/lib/api";
import { AITask } from "@/types/ai-task";
import Link from "next/link";
import { Menu, ChevronLeft } from "lucide-react"; // 아이콘 라이브러리 (설치 필요: lucide-react)

export default function Sidebar() {
  const pathname = usePathname();
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // 💡 사이드바 열림/닫힘 상태
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
  }, [pathname]);

  return (
    <div
      className={`relative h-full flex flex-col text-black border-r bg-white transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* 💡 토글 버튼 (사이드바 오른쪽 상단에 위치) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white border rounded-full p-1 hover:bg-gray-100 shadow-sm z-10"
      >
        {isCollapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div
        className={`p-4 h-full flex flex-col ${isCollapsed ? "items-center" : ""}`}
      >
        {/* 로고 영역 */}
        <Link
          href="/"
          className={`font-bold mb-8 p-2 hover:text-blue-600 transition-all block truncate ${
            isCollapsed ? "text-lg" : "text-xl"
          }`}
        >
          {isCollapsed ? "✨" : "FlowMind AI ✨"}
        </Link>

        {/* 내비게이션 영역 */}
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
                    <Link
                      key={task.id}
                      href={`/tasks/${task.id}`}
                      className={`block p-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors truncate ${
                        isCollapsed ? "text-center" : ""
                      }`}
                      title={task.input_text} // 닫혔을 때 툴팁 제공
                    >
                      <span
                        className={`font-medium text-blue-500 ${isCollapsed ? "" : "mr-2"}`}
                      >
                        [{task.task_type[0].toUpperCase()}]
                      </span>
                      {!isCollapsed && task.input_text}
                    </Link>
                  ))
                : !isCollapsed && (
                    <p className="text-sm text-gray-400 px-2">
                      기록이 없습니다.
                    </p>
                  )}
            </div>
          )}
        </nav>

        {/* 하단 유저 정보 영역 */}
        <div className="border-t pt-4 mt-4 w-full">
          <div
            className={`px-2 py-1 text-xs text-gray-500 flex flex-col gap-1 ${isCollapsed ? "items-center" : ""}`}
          >
            {isCollapsed ? (
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
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
    </div>
  );
}
