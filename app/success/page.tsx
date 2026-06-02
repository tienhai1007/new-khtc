'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  CheckCircle2,
  FileText,
  Printer,
  MapPin,
  ArrowRight,
  Download,
  AlertCircle,
} from 'lucide-react';

type MucDich = 'mo-moi' | 'thay-doi' | 'cap-lai-mat-khau';
type DoiTuong = 'khach-hang-to-chuc' | 'ho-kinh-doanh';

interface LastSubmission {
  mucDich: MucDich;
  doiTuong: DoiTuong;
  orgName: string;
  submittedAt: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mucDich = searchParams.get('mucDich') as MucDich;
  const doiTuong = searchParams.get('doiTuong') as DoiTuong;

  const [submission, setSubmission] = useState<LastSubmission | null>(null);

  useEffect(() => {
    // Thử lấy thông tin submission từ sessionStorage
    const saved = sessionStorage.getItem('lastSubmission');
    if (saved) {
      try {
        setSubmission(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Xác định thông tin hiển thị
  const getDisplayInfo = () => {
    let mdText = '';
    let bmText = '';
    if (mucDich === 'mo-moi') {
      mdText = 'Đăng ký mở mới tài khoản & dịch vụ';
      bmText = 'BM01';
    } else if (mucDich === 'thay-doi') {
      mdText = 'Thay đổi thông tin tài khoản';
      bmText = 'BM01';
    } else {
      mdText = 'Yêu cầu cấp lại mật khẩu NHĐT';
      bmText = 'BM02';
    }

    const dtText = doiTuong === 'khach-hang-to-chuc' ? 'Khách hàng tổ chức' : 'Hộ kinh doanh';

    return { mdText, dtText, bmText };
  };

  const { mdText, dtText, bmText } = getDisplayInfo();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="glass-header sticky top-0 z-40 w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <Image
            src="/logo-bidv-hadong.png"
            alt="BIDV Chi nhánh Hà Đông"
            width={120}
            height={40}
            className="h-9 w-auto object-contain cursor-pointer"
            onClick={() => router.push('/')}
            priority
          />
          <div className="border-l border-neutral-200 pl-3 hidden sm:block">
            <p className="text-xs font-semibold text-bidv-teal">Hệ thống biểu mẫu trực tuyến</p>
            <p className="text-[10px] text-neutral-400">BIDV Hà Đông</p>
          </div>
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
        <div
          className="bg-white rounded-3xl border border-neutral-200 shadow-premium p-8 md:p-10 text-center space-y-8"
          style={{ animation: 'var(--animate-scale-up)' }}
        >
          {/* Animated Success Badge */}
          <div className="flex justify-center">
            <div
              className="w-20 h-20 bg-bidv-mint-light rounded-full flex items-center justify-center text-bidv-mint"
              style={{ animation: 'success-bounce 0.6s ease-out forwards' }}
            >
              <CheckCircle2 className="w-12 h-12" />
            </div>
          </div>

          {/* Titles */}
          <div className="space-y-2">
            <h1 className="text-xl md:text-2xl font-bold text-neutral-900">
              Hoàn thành nhập dữ liệu!
            </h1>
            <p className="text-sm text-neutral-500 max-w-md mx-auto">
              Hệ thống đã ghi nhận thông tin của bạn và tự động điền vào biểu mẫu <span className="font-semibold text-bidv-teal">{bmText}</span>.
            </p>
          </div>

          {/* Submission Info Box */}
          <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 text-left space-y-3 max-w-lg mx-auto">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Thông tin hồ sơ
            </h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <span className="text-neutral-500 col-span-1">Khách hàng:</span>
              <span className="text-neutral-900 font-semibold col-span-2">
                {submission?.orgName || 'Đang cập nhật...'}
              </span>

              <span className="text-neutral-500 col-span-1">Loại biểu mẫu:</span>
              <span className="text-neutral-900 font-semibold col-span-2">
                {bmText} — {mdText}
              </span>

              <span className="text-neutral-500 col-span-1">Đối tượng:</span>
              <span className="text-neutral-900 font-medium col-span-2">
                {dtText}
              </span>
            </div>
          </div>

          {/* Next Steps / Hướng dẫn tiếp theo */}
          <div className="text-left max-w-lg mx-auto space-y-4 pt-2">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <Printer className="w-4 h-4 text-bidv-teal" />
              Các bước tiếp theo cần thực hiện:
            </h3>

            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-bidv-teal-light text-bidv-teal text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  <span className="font-semibold text-neutral-900">In biểu mẫu:</span> Kiểm tra thư mục tải về trên thiết bị để mở file Word (`.docx`) vừa được tải xuống. Hãy in biểu mẫu này ra giấy A4.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-bidv-teal-light text-bidv-teal text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  <span className="font-semibold text-neutral-900">Ký & đóng dấu:</span> Người đại diện theo pháp luật ký, ghi rõ họ tên và đóng dấu hợp pháp của doanh nghiệp/hộ kinh doanh vào các vị trí quy định trên đơn.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-bidv-teal-light text-bidv-teal text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  <span className="font-semibold text-neutral-900">Nộp tại quầy:</span> Mang biểu mẫu kèm theo bộ hồ sơ pháp lý (CCCD người đại diện, GCN đăng ký doanh nghiệp bản gốc/sao y...) đến quầy giao dịch gần nhất của <span className="font-semibold text-bidv-teal">BIDV Chi nhánh Hà Đông</span> để hoàn tất thủ tục.
                </p>
              </div>
            </div>
          </div>

          {/* Location Box */}
          <div className="bg-bidv-teal-light/50 border border-bidv-teal/10 rounded-2xl p-4 flex items-start gap-3 text-left max-w-lg mx-auto">
            <MapPin className="w-5 h-5 text-bidv-teal flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-bidv-teal-dark">BIDV Chi nhánh Hà Đông</h4>
              <p className="text-[11px] text-neutral-600">197 Quang Trung, Hà Đông, Hà Nội</p>
              <p className="text-[10px] text-neutral-400">Thời gian làm việc: Thứ 2 đến Thứ 6 (Sáng 8:00 - 12:00, Chiều 13:00 - 17:00)</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-neutral-100">
            <button
              onClick={() => router.push('/')}
              className="btn-outline w-full sm:w-auto py-2.5 px-5 text-xs"
            >
              Quay lại Trang chủ
            </button>
            <button
              onClick={() => {
                // Tải lại bằng cách reload hoặc hướng dẫn người dùng
                alert('Nếu file không tự động tải về, bạn có thể thực hiện lại bước nhập liệu hoặc liên hệ bộ phận hỗ trợ chi nhánh.');
              }}
              className="btn-primary w-full sm:w-auto py-2.5 px-5 text-xs shadow-card"
            >
              Tôi chưa nhận được file tải về
            </button>
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-neutral-200 bg-white py-4 px-4 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-neutral-400">
            © 2026 BIDV Chi nhánh Hà Đông — Hệ thống nội bộ
          </p>
          <p className="text-xs text-neutral-400">
            197 Quang Trung, Hà Đông, Hà Nội
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <p className="text-sm text-neutral-500">Đang tải...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
