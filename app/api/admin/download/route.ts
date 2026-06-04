import { NextRequest, NextResponse } from 'next/server';
import { fillDocxTemplate, fillMultipleTemplatesAsZip, buildFileName, TemplateId } from '@/lib/docxFiller';
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
    const { templateId, data, mucDich, doiTuong } = body;

    if (!templateId || !data) {
      return NextResponse.json(
        { message: 'Thiếu thông tin templateId hoặc dữ liệu để điền.' },
        { status: 400 }
      );
    }

    const tenToChuc = data.TEN_TO_CHUC_VI || 'KH';

    // 3. Nếu tải biểu mẫu chính BM01 loại đăng ký mở mới của KHTC/HKD -> tải file ZIP tổng hợp
    if (templateId === 'BM01' && mucDich === 'mo-moi' && (doiTuong === 'khach-hang-to-chuc' || doiTuong === 'ho-kinh-doanh')) {
      let zipBuffer: Buffer;
      const zipFileName = buildFileName('ZIP_BM01', tenToChuc);

      if (doiTuong === 'khach-hang-to-chuc') {
        zipBuffer = await fillMultipleTemplatesAsZip(
          [
            { templateId: 'BM01', outputName: buildFileName('BM01', tenToChuc) },
            { templateId: 'TB_mau_dau', outputName: buildFileName('TB_mau_dau', tenToChuc) }
          ],
          data,
          [
            {
              templateFileName: 'Danh mục hồ sơ & Hướng dẫn ký đóng dấu.docx',
              outputName: 'Danh mục hồ sơ & Hướng dẫn ký đóng dấu.docx'
            }
          ]
        );
      } else {
        zipBuffer = await fillMultipleTemplatesAsZip(
          [
            { templateId: 'BM01', outputName: buildFileName('BM01', tenToChuc) },
            { templateId: 'CAM_KET', outputName: buildFileName('CAM_KET', tenToChuc) }
          ],
          data
        );
      }

      const headers = new Headers();
      headers.set('Content-Type', 'application/zip');
      headers.set(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(zipFileName)}"`
      );
      headers.set('Access-Control-Expose-Headers', 'Content-Disposition');

      return new NextResponse(new Uint8Array(zipBuffer), {
        status: 200,
        headers,
      });
    }

    // 4. Sinh file đơn lẻ từ template và dữ liệu
    const docxBuffer = await fillDocxTemplate(templateId as TemplateId, data);
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

