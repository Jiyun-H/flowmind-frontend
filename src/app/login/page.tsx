"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api"; // 💡 통합된 login 함수 임포트

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 💡 이제 login 함수가 알아서 API를 호출하고 결과(JSON)를 반환합니다.
      const data = await login({ email, password });

      // 💡 login 함수 내부에서 에러가 나면 catch문으로 가기 때문에
      // 여기까지 왔다면 로그인 성공입니다.
      localStorage.setItem("access_token", data.access_token);

      router.push("/dashboard"); // 로그인 후 대시보드로 이동
      router.refresh(); // 페이지 상태 새로고침
    } catch (error) {
      // 💡 api.ts에서 던진 에러 메시지("이메일 또는 비밀번호가 올바르지 않습니다" 등)가 출력됩니다.
      console.error("Login error:", error);
      alert(
        error instanceof Error ? error.message : "로그인에 실패했습니다.",
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      {/* ... 나머지 JSX 코드는 기존과 동일 ... */}
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-4 rounded-lg bg-white p-8 shadow-md"
      >
        <h1 className="text-2xl font-bold text-gray-900">FlowMind 로그인</h1>
        <input
          type="email"
          placeholder="이메일"
          className="w-full rounded border p-2 text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          className="w-full rounded border p-2 text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full rounded bg-blue-600 p-2 font-semibold text-white hover:bg-blue-700"
        >
          로그인
        </button>
        <p className="text-center text-sm text-gray-600">
          계정이 없으신가요?{" "}
          <a href="/signup" className="text-blue-600">
            회원가입
          </a>
        </p>
      </form>
    </div>
  );
}
