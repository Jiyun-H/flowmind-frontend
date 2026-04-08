import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 쿠키를 사용한다면 여기서 토큰 존재 여부 확인 가능
  // 현재는 클라이언트 사이드 LocalStorage 기반이므로
  // 실제 서비스 시에는 쿠키 방식으로 전환하는 것이 보안상 유리합니다.
}
