import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import path from 'path';

export type TemplateId = 'BM01' | 'BM02';

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
 * Tên file khi download, theo quy ước:
 * BM01_TenToChuc_YYYYMMDD.docx
 */
export function buildFileName(
  templateId: TemplateId,
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
  return `${templateId}_${safeName}_${today}.docx`;
}
