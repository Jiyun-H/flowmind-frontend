"use client";
import { useState, useEffect } from "react"; // 💡 useEffect 추가
import { useRouter } from "next/navigation"; // 💡 useRouter 추가
import { createAITask } from "@/lib/api";
import { AITask, TaskType } from "@/types/ai-task";

export default function Home() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [type, setType] = useState<TaskType>("structure");
  const [result, setResult] = useState<AITask | null>(null);
  const [loading, setLoading] = useState(false);

  // 💡 인증 체크 상태를 관리합니다 (무한 루프 방지 핵심)
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // 1. 페이지 접속 시 로그인 여부 딱 한 번 체크
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      // 토큰 없으면 바로 로그인 페이지로 (replace를 써야 뒤로가기 무한루프 안 걸림)
      router.replace("/login");
    } else {
      // 토큰이 있을 때만 화면을 보여주도록 허용
      setIsAuthChecked(true);
    }
  }, [router]);

  const handleSubmit = async () => {
    if (!input.trim()) return alert("내용을 입력해주세요.");

    setLoading(true);
    setResult(null);

    try {
      const data = await createAITask({
        task_type: type,
        input_text: input,
      });
      setResult(data);
    } catch (e: any) {
      console.error(e);
      // 에러가 401(인증만료)인 경우 알림 후 이동
      if (e.message.includes("인증")) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        router.push("/login");
      } else {
        alert(e.message || "에러가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. 💡 인증 확인 전에는 "아무것도" 렌더링하지 않습니다.
  // 이 처리가 없으면 토큰 없이 createAITask 등이 실행되어 401 에러가 납니다.
  if (!isAuthChecked) return null;

  return (
    <main className="max-w-4xl mx-auto p-8 text-black">
      <h1 className="text-3xl font-bold mb-8">FlowMind AI ✨</h1>

      {/* ... 나머지 JSX 코드는 동일 ... */}
      <div className="space-y-4 mb-8">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as TaskType)}
          className="w-full p-2 border rounded bg-white text-black"
        >
          <option value="structure">SDLC 구조화</option>
          <option value="summarize">회의록 요약</option>
          <option value="suggest">액션 아이템 제안</option>
        </select>

        <textarea
          className="w-full h-40 p-4 border rounded bg-white text-black"
          placeholder="아이디어를 입력하세요..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-4 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? "Gemini가 분석 중입니다..." : "AI 분석 시작"}
        </button>
      </div>

      {result && (
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">분석 결과</h2>
          <div className="whitespace-pre-wrap leading-relaxed text-gray-800">
            {typeof result.result_json === "string"
              ? result.result_json
              : JSON.stringify(result.result_json, null, 2)}
          </div>
        </div>
      )}
    </main>
  );
}
