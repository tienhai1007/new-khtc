import { NextRequest, NextResponse } from 'next/server';
import { fillDocxTemplate, fillMultipleTemplatesAsZip, buildFileName, TemplateId } from '@/lib/docxFiller';
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

    // 1. Xác định loại template biểu mẫu và gửi Google Sheets trước
    const templateId: TemplateId = mucDich === 'cap-lai-mat-khau' ? 'BM02' : 'BM01';

    // 2. Gửi thông tin ghi nhận lên Google Sheet qua Google Apps Script Web App
    try {
      await submitToGoogleSheet({ mucDich, doiTuong, data });
    } catch (sheetError) {
      console.error('Lỗi khi ghi dữ liệu lên Google Sheet:', sheetError);
    }

    const tenToChuc = data.TEN_TO_CHUC_VI || 'KH';

    // 3. Kiểm tra xem có cần đóng gói thành ZIP không (Chỉ mở mới BM01 và đối tượng là KHTC hoặc HKD)
    if (mucDich === 'mo-moi' && templateId === 'BM01' && (doiTuong === 'khach-hang-to-chuc' || doiTuong === 'ho-kinh-doanh')) {
      let zipBuffer: Buffer;
      const zipFileName = buildFileName('ZIP_BM01', tenToChuc);

      if (doiTuong === 'khach-hang-to-chuc') {
        // Nén 3 file: BM01 (autofill), TB_mau_dau (autofill), Danh mục hồ sơ & Hướng dẫn (tĩnh)
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
        // Hộ kinh doanh: Nén 2 file: BM01 (autofill) và CAM_KET (autofill)
        zipBuffer = await fillMultipleTemplatesAsZip(
          [
            { templateId: 'BM01', outputName: buildFileName('BM01', tenToChuc) },
            { templateId: 'CAM_KET', outputName: buildFileName('CAM_KET', tenToChuc) }
          ],
          data
        );
      }

      // Trả về file ZIP
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

    // 4. Sinh file Word .docx đơn lẻ từ template và data (nếu không thoả điều kiện nén ZIP)
    const docxBuffer = await fillDocxTemplate(templateId, data);
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

