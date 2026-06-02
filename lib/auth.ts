import { NextRequest } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@bidv2026';
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'BIDV_HADONG_SECRET_2026';

// Tạo một session token tĩnh dựa trên mật khẩu để so sánh nhanh
// Trên thực tế, có thể sử dụng mã hóa phức tạp hơn, nhưng với nhu cầu nội bộ,
// việc so sánh token dựa trên ADMIN_PASSWORD thông qua cookie httpOnly là an toàn và đủ dùng.
export function getExpectedSessionToken(): string {
  const rawStr = `${ADMIN_PASSWORD}:${AUTH_TOKEN}`;
  const hash = typeof btoa === 'function'
    ? btoa(rawStr)
    : Buffer.from(rawStr).toString('base64');
  return `session_${hash}`;
}

/**
 * Kiểm tra xem request có chứa cookie admin_session hợp lệ hay không
 */
export function isAuthenticated(req: NextRequest): boolean {
  const sessionCookie = req.cookies.get('admin_session')?.value;
  const expectedToken = getExpectedSessionToken();
  return sessionCookie === expectedToken;
}
