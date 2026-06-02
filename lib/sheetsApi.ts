/**
 * sheetsApi.ts — Wrapper API để gửi/nhận dữ liệu từ Google Apps Script Web App
 */

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'BIDV_HADONG_SECRET_2026';

export interface SubmissionData {
  mucDich: string;
  doiTuong: string;
  data: Record<string, string>;
}

export interface SubmissionRecord {
  _rowId: number;
  SYSTEM_TIMESTAMP: string;
  SYSTEM_MUC_DICH: string;
  SYSTEM_DOI_TUONG: string;
  [key: string]: any;
}

export interface GetSubmissionsResponse {
  BM01: SubmissionRecord[];
  BM02: SubmissionRecord[];
}

/**
 * Gửi hồ sơ đăng ký mới lên Google Sheet (thông qua Apps Script Web App)
 */
export async function submitToGoogleSheet(payload: SubmissionData): Promise<any> {
  if (!GOOGLE_SCRIPT_URL) {
    console.warn('WARNING: GOOGLE_SCRIPT_URL is not configured in environment variables. Skipping Google Sheet write.');
    return { status: 'skipped', message: 'Google Script URL not configured' };
  }

  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain', // Google Apps Script yêu cầu text/plain hoặc không header để tránh CORS preflight OPTIONS
    },
    body: JSON.stringify({
      token: AUTH_TOKEN,
      mucDich: payload.mucDich,
      doiTuong: payload.doiTuong,
      data: payload.data,
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Apps Script responded with status ${response.status}`);
  }

  const json = await response.json();
  if (json.status === 'error') {
    throw new Error(json.message || 'Error writing to Google Sheet');
  }

  return json;
}

/**
 * Lấy danh sách hồ sơ từ Google Sheet (dành cho trang Admin)
 */
export async function getSubmissionsFromGoogleSheet(): Promise<GetSubmissionsResponse> {
  if (!GOOGLE_SCRIPT_URL) {
    throw new Error('GOOGLE_SCRIPT_URL is not configured in environment variables.');
  }

  const url = `${GOOGLE_SCRIPT_URL}?token=${encodeURIComponent(AUTH_TOKEN)}`;
  const response = await fetch(url, {
    method: 'GET',
    // Cấu hình cache: no-store để luôn lấy dữ liệu mới nhất
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Google Apps Script responded with status ${response.status}`);
  }

  const json = await response.json();
  if (json.status === 'error') {
    throw new Error(json.message || 'Error reading from Google Sheet');
  }

  return json.data as GetSubmissionsResponse;
}
