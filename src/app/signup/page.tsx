"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "@/lib/api"; // 💡 통합된 signup 함수 임포트

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 💡 이제 signup 함수가 API 호출과 에러 처리를 담당합니다.
      await signup({ email, password });

      alert("회원가입 성공! 로그인해 주세요.");
      router.push("/login");
    } catch (error: any) {
      // 💡 api.ts에서 던진 상세 에러 메시지("이미 존재하는 이메일입니다" 등)가 출력됩니다.
      console.error("Signup error:", error);
      alert(error.message || "회원가입에 실패했습니다.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 text-black">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md space-y-4 rounded-lg bg-white p-8 shadow-md"
      >
        <h1 className="text-2xl font-bold">FlowMind 회원가입</h1>
        <input
          type="email"
          placeholder="이메일"
          className="w-full border p-2 rounded text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          className="w-full border p-2 rounded text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 p-2 text-white rounded font-bold hover:bg-green-700 transition"
        >
          가입하기
        </button>
        <p className="text-center text-sm text-gray-600">
          이미 계정이 있으신가요?{" "}
          <a href="/login" className="text-blue-600">
            로그인
          </a>
        </p>
      </form>
    </div>
  );
}
