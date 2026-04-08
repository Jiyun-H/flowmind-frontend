"use client";

import { useEffect, useState, use } from "react"; // 💡 use 추가
import { useParams } from "next/navigation";
import { AITask } from "@/types/ai-task";
import ReactMarkdown from "react-markdown";
import { getTaskDetail } from "@/lib/api";

export default function TaskDetailPage() {
  const params = useParams();
  const [task, setTask] = useState<AITask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // 💡 에러 상태 추가

  useEffect(() => {
    async function fetchDetail() {
      // params.id가 없거나 배열인 경우를 대비해 안전하게 처리
      const id = Array.isArray(params.id) ? params.id[0] : params.id;

      if (!id) return;

      try {
        setLoading(true);
        const data = await getTaskDetail(id);
        setTask(data);
      } catch (err) {
        console.error("상세 정보 로딩 실패:", err);
        setError("기록을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [params.id]);

  if (loading)
    return (
      <div className="p-8 text-gray-500 animate-pulse">
        기록을 불러오는 중...
      </div>
    );
  if (error || !task)
    return (
      <div className="p-8 text-red-500">
        {error || "기록을 찾을 수 없습니다."}
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8 border-b pb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            {task.task_type}
          </span>
          <span className="text-gray-400 text-sm">
            {new Date(task.created_at).toLocaleString("ko-KR")}
          </span>
        </div>
        <h1 className="text-sm font-semibold text-gray-400 uppercase mb-2">
          질문 내용
        </h1>
        <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded-r-lg">
          <p className="text-gray-700 italic leading-relaxed">
            `{task.input_text}`
          </p>
        </div>
      </div>

      <div className="bg-white p-8 border rounded-2xl shadow-sm leading-relaxed">
        <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
          AI 분석 결과
        </h2>
        {/* prose 클래스는 마크다운 글자들을 예쁘게 정렬해줍니다 (tailwind/typography 설치 시) */}
        <article className="prose prose-blue max-w-none text-gray-800">
          <ReactMarkdown>
            {task.result_json?.content || "결과가 없습니다."}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
