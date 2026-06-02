import { NextRequest, NextResponse } from 'next/server';
import { fillDocxTemplate, buildFileName, TemplateId } from '@/lib/docxFiller';
import { isAuthenticated } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // 1. Kiểm tra quyền truy cập Admin
    if (!isAuthenticated(req)) {
      return NextResponse.json(
        { message: 'Yêu cầu đăng nhập quản trị.' },
        { status: 401 }
      );
    }

    // 2. Nhận dữ liệu sinh file
    const body = await req.json();
    const { templateId, data } = body;

    if (!templateId || !data) {
      return NextResponse.json(
        { message: 'Thiếu thông tin templateId hoặc dữ liệu để điền.' },
        { status: 400 }
      );
    }

    // 3. Sinh file Word .docx từ template và dữ liệu
    const docxBuffer = await fillDocxTemplate(templateId as TemplateId, data);

    // 4. Lấy tên file phù hợp
    const tenToChuc = data.TEN_TO_CHUC_VI || 'KH';
    const fileName = buildFileName(templateId as TemplateId, tenToChuc);

    // 5. Trả về buffer file docx dưới dạng stream cho client tải về
    const headers = new Headers();
    headers.set(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    headers.set(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileName)}"`
    );
    headers.set('Access-Control-Expose-Headers', 'Content-Disposition');

    return new NextResponse(new Uint8Array(docxBuffer), {
      status: 200,
      headers,
    });

  } catch (error: any) {
    console.error('Lỗi API Admin Download:', error);
    return NextResponse.json(
      { message: error.message || 'Đã xảy ra lỗi hệ thống khi tải biểu mẫu.' },
      { status: 500 }
    );
  }
}
