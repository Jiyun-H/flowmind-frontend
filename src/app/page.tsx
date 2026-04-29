"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-xl font-bold text-blue-600">
          FlowMind AI
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-gray-600 transition hover:text-blue-600"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            시작하기
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-76px)] max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue-600">
            AI Project Workspace
          </p>
          <h1 className="text-4xl font-bold leading-tight text-gray-950 sm:text-5xl">
            AI와 함께 소프트웨어 프로젝트를 시작해 보세요
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            아이디어를 정리하고, SDLC 단계별 실행 계획을 만들고, 분석 기록을
            한곳에서 관리하세요.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-700"
            >
              회원가입해서 프로젝트 시작하기
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded border border-gray-200 px-6 py-3 text-base font-semibold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              로그인
            </Link>
          </div>
        </div>

        <div className="rounded border border-gray-100 bg-gray-50 p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                프로젝트 플래닝
              </p>
              <p className="text-xs text-gray-500">FlowMind AI 분석 예시</p>
            </div>
            <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
              Ready
            </span>
          </div>
          <div className="space-y-3">
            {[
              "요구사항을 기능 단위로 구조화",
              "설계, 개발, 테스트 단계별 체크리스트 생성",
              "회의록에서 액션 아이템 자동 추출",
            ].map((item) => (
              <div
                key={item}
                className="rounded border border-gray-100 bg-white p-4 text-sm text-gray-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
