import { NextRequest, NextResponse } from 'next/server';
import { getExpectedSessionToken } from '@/lib/auth';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@bidv2026';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { message: 'Vui lòng nhập mật khẩu.' },
        { status: 400 }
      );
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { message: 'Mật khẩu đăng nhập không chính xác.' },
        { status: 401 }
      );
    }

    // Đăng nhập thành công, tạo cookie session httpOnly
    const sessionToken = getExpectedSessionToken();
    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: 'admin_session',
      value: sessionToken,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // Hết hạn sau 24h
      sameSite: 'lax',
    });

    return response;

  } catch (error: any) {
    console.error('Lỗi API Login:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi hệ thống.' },
      { status: 500 }
    );
  }
}
