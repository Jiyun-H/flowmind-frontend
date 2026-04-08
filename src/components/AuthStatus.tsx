"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AuthStatus() {
  const router = useRouter();
  const pathname = usePathname();

  // 1. 초기 상태를 null로 두어 서버/클라이언트 불일치(Hydration) 에러를 방지합니다.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // 2. 컴포넌트가 마운트된 직후 한 번만 체크합니다.
    const token = localStorage.getItem("access_token");
    const hasToken = !!token;
    setIsLoggedIn((prev) => {
      if (prev !== hasToken) return hasToken;
      return prev;
    });
  }, [pathname]); // 페이지 이동 시에만 체크

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    router.push("/login");
    router.refresh();
  };

  // 3. 아직 상태 체크 중(null)일 때는 아무것도 렌더링하지 않거나 로딩 스켈레톤을 보여줍니다.
  if (isLoggedIn === null) return <div className="w-16 h-8" />;

  // 로그인/회원가입 페이지에서는 숨김
  if (pathname === "/login" || pathname === "/signup") return null;

  return (
    <div className="flex items-center gap-4">
      {isLoggedIn ? (
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-gray-500 hover:text-red-600 transition"
        >
          로그아웃
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            시작하기
          </Link>
        </div>
      )}
    </div>
  );
}
