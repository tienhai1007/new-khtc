import { NextRequest, NextResponse } from 'next/server';
import { getSubmissionsFromGoogleSheet } from '@/lib/sheetsApi';
import { isAuthenticated } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // 1. Kiểm tra quyền truy cập Admin
    if (!isAuthenticated(req)) {
      return NextResponse.json(
        { message: 'Yêu cầu đăng nhập quản trị.' },
        { status: 401 }
      );
    }

    // 2. Lấy dữ liệu từ Google Sheets
    try {
      const submissions = await getSubmissionsFromGoogleSheet();
      return NextResponse.json({
        success: true,
        data: submissions,
      });
    } catch (sheetError: any) {
      console.error('Lỗi kết nối Google Sheet:', sheetError);
      
      // Nếu chưa cấu hình hoặc URL lỗi, trả về danh sách rỗng và cờ báo để frontend hướng dẫn setup
      const isConfigError = !process.env.GOOGLE_SCRIPT_URL;
      return NextResponse.json({
        success: false,
        isConfigError,
        message: isConfigError
          ? 'Chưa cấu hình biến môi trường GOOGLE_SCRIPT_URL.'
          : 'Không thể kết nối đến Google Sheets. Vui lòng kiểm tra lại URL Apps Script và phân quyền.',
        data: { BM01: [], BM02: [] }
      });
    }

  } catch (error: any) {
    console.error('Lỗi API Submissions:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi hệ thống.' },
      { status: 500 }
    );
  }
}
