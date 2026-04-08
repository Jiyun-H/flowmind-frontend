// frontend/src/components/LogoutButton.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const pathname = usePathname();

  // 로그인이나 회원가입 페이지에서는 로그아웃 버튼을 숨깁니다.
  if (pathname === "/login" || pathname === "/signup") return null;

  const handleLogout = () => {
    // 1. 토큰 삭제
    localStorage.removeItem("access_token");
    // 2. 로그인 페이지로 리다이렉트
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm font-medium text-gray-500 hover:text-red-600 transition"
    >
      로그아웃
    </button>
  );
}
