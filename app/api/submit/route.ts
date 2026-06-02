import { NextRequest, NextResponse } from 'next/server';
import { fillDocxTemplate, buildFileName, TemplateId } from '@/lib/docxFiller';
import { submitToGoogleSheet } from '@/lib/sheetsApi';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mucDich, doiTuong, data } = body;

    if (!mucDich || !doiTuong || !data) {
      return NextResponse.json(
        { message: 'Thiếu thông tin bắt buộc (mucDich, doiTuong, hoặc data).' },
        { status: 400 }
      );
    }

    // 1. Xác định loại template biểu mẫu
    const templateId: TemplateId = mucDich === 'cap-lai-mat-khau' ? 'BM02' : 'BM01';

    // 2. Gửi thông tin ghi nhận lên Google Sheet qua Google Apps Script Web App
    // Bọc trong try-catch để nếu Google Sheet gặp sự cố hoặc chưa cấu hình URL,
    // khách hàng vẫn có thể tải biểu mẫu về máy mà không bị dừng đột ngột.
    try {
      await submitToGoogleSheet({ mucDich, doiTuong, data });
    } catch (sheetError) {
      console.error('Lỗi khi ghi dữ liệu lên Google Sheet:', sheetError);
      // Tiếp tục sinh file Word, không ném lỗi ra ngoài làm gián đoạn người dùng
    }

    // 3. Sinh file Word .docx từ template và data
    const docxBuffer = await fillDocxTemplate(templateId, data);

    // 4. Lấy tên file phù hợp
    const tenToChuc = data.TEN_TO_CHUC_VI || 'KH';
    const fileName = buildFileName(templateId, tenToChuc);

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
    // Cho phép client truy cập header Content-Disposition để biết tên file
    headers.set('Access-Control-Expose-Headers', 'Content-Disposition');

    return new NextResponse(new Uint8Array(docxBuffer), {
      status: 200,
      headers,
    });

  } catch (error: any) {
    console.error('Lỗi API Submit:', error);
    return NextResponse.json(
      { message: error.message || 'Đã xảy ra lỗi hệ thống.' },
      { status: 500 }
    );
  }
}
