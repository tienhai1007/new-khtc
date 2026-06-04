import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

export type TemplateId = 'BM01' | 'BM02' | 'TB_mau_dau' | 'CAM_KET';

/**
 * Điền placeholder {{KEY}} vào template .docx và trả về Buffer.
 * Template được đọc từ server/templates/<id>_template.docx
 * Giá trị undefined/null sẽ được thay bằng chuỗi rỗng (không lỗi).
 */
export async function fillDocxTemplate(
  templateId: TemplateId,
  data: Record<string, string>
): Promise<Buffer> {
  const templatePath = path.join(
    process.cwd(),
    'server',
    'templates',
    `${templateId}_template.docx`
  );

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template không tồn tại: ${templatePath}`);
  }

  const content = fs.readFileSync(templatePath);
  const zip = new PizZip(content);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{{', end: '}}' },
    // Trả về chuỗi rỗng cho mọi placeholder không có giá trị
    nullGetter: () => '',
  });

  // Chuẩn hoá: trim whitespace, undefined → ''
  const safeData: Record<string, string> = {};
  for (const [key, val] of Object.entries(data)) {
    safeData[key] = (val ?? '').toString().trim();
  }

  doc.render(safeData);

  return doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  }) as Buffer;
}

/**
 * Điền nhiều template cùng lúc và nén thành 1 file ZIP (in-memory).
 * staticFiles là danh sách các tên file tĩnh không cần điền dữ liệu, chỉ lấy từ server/templates/
 */
export async function fillMultipleTemplatesAsZip(
  configs: { templateId: TemplateId; outputName: string }[],
  data: Record<string, string>,
  staticFiles: { templateFileName: string; outputName: string }[] = []
): Promise<Buffer> {
  const zip = new JSZip();

  // 1. Điền dữ liệu vào các template động
  for (const config of configs) {
    const docxBuffer = await fillDocxTemplate(config.templateId, data);
    zip.file(config.outputName, docxBuffer);
  }

  // 2. Thêm các file tĩnh nếu có
  for (const sf of staticFiles) {
    const staticPath = path.join(
      process.cwd(),
      'server',
      'templates',
      sf.templateFileName
    );
    if (fs.existsSync(staticPath)) {
      const staticBuffer = fs.readFileSync(staticPath);
      zip.file(sf.outputName, staticBuffer);
    }
  }

  // 3. Tạo buffer ZIP
  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });

  return zipBuffer;
}

/**
 * Tên file khi download, theo quy ước:
 * BM01_TenToChuc_YYYYMMDD.docx
 */
export function buildFileName(
  templateId: TemplateId | 'ZIP_BM01',
  tenToChuc: string
): string {
  const today = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '');
  const safeName = (tenToChuc || 'KHTC')
    .replace(/[^a-zA-Z0-9À-ỹ\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 40);
  
  if (templateId === 'ZIP_BM01') {
    return `BM01_HoSo_${safeName}_${today}.zip`;
  }
  return `${templateId}_${safeName}_${today}.docx`;
}

