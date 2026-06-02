import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@bidv2026';
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'BIDV_HADONG_SECRET_2026';

function getExpectedSessionToken(): string {
  const rawStr = `${ADMIN_PASSWORD}:${AUTH_TOKEN}`;
  const hash = typeof btoa === 'function'
    ? btoa(rawStr)
    : Buffer.from(rawStr).toString('base64');
  return `session_${hash}`;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const adminSession = req.cookies.get('admin_session')?.value;
  const expectedToken = getExpectedSessionToken();
  const isLoggedIn = adminSession === expectedToken;

  // 1. Bảo vệ các trang quản trị giao diện (/admin)
  if (pathname.startsWith('/admin')) {
    // Cho phép truy cập vào trang login mà không cần đăng nhập
    if (pathname === '/admin/login') {
      if (isLoggedIn) {
        // Nếu đã đăng nhập mà cố vào login, redirect về trang dashboard chính
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      return NextResponse.next();
    }

    // Nếu chưa đăng nhập, chuyển hướng sang trang login
    if (!isLoggedIn) {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Bảo vệ các API quản trị (/api/admin)
  if (pathname.startsWith('/api/admin')) {
    // Bỏ qua kiểm tra cho API login
    if (pathname === '/api/admin/login') {
      return NextResponse.next();
    }

    // Nếu chưa đăng nhập, từ chối request API
    if (!isLoggedIn) {
      return NextResponse.json(
        { message: 'Yêu cầu đăng nhập quản trị.' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

// Chỉ áp dụng middleware cho các router quản trị
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
