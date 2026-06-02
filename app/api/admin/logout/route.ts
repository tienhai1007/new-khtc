import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    
    // Xoá cookie admin_session bằng cách gán maxAge = 0
    response.cookies.set({
      name: 'admin_session',
      value: '',
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      sameSite: 'lax',
    });

    return response;

  } catch (error: any) {
    console.error('Lỗi API Logout:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi hệ thống.' },
      { status: 500 }
    );
  }
}
