'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Building2,
  Store,
  FilePlus,
  FileEdit,
  KeyRound,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Shield,
  Clock,
  Download,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

type MucDich = 'mo-moi' | 'thay-doi' | 'cap-lai-mat-khau';
type DoiTuong = 'khach-hang-to-chuc' | 'ho-kinh-doanh';

interface MucDichOption {
  id: MucDich;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  bm: string;
}

interface DoiTuongOption {
  id: DoiTuong;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

// ── Data ─────────────────────────────────────────────────────────────────────

const MUC_DICH_OPTIONS: MucDichOption[] = [
  {
    id: 'mo-moi',
    label: 'Đăng ký mở mới',
    sublabel: 'Mở tài khoản thanh toán và đăng ký dịch vụ lần đầu',
    icon: FilePlus,
    bm: 'BM01',
  },
  {
    id: 'thay-doi',
    label: 'Thay đổi thông tin',
    sublabel: 'Cập nhật thông tin doanh nghiệp, người đại diện, dịch vụ',
    icon: FileEdit,
    bm: 'BM01',
  },
  {
    id: 'cap-lai-mat-khau',
    label: 'Cấp lại mật khẩu NHĐT',
    sublabel: 'Yêu cầu cấp lại mật khẩu dịch vụ ngân hàng điện tử',
    icon: KeyRound,
    bm: 'BM02',
  },
];

const DOI_TUONG_OPTIONS: DoiTuongOption[] = [
  {
    id: 'khach-hang-to-chuc',
    label: 'Khách hàng tổ chức',
    sublabel: 'Doanh nghiệp, công ty, tổ chức kinh tế',
    icon: Building2,
  },
  {
    id: 'ho-kinh-doanh',
    label: 'Hộ kinh doanh',
    sublabel: 'Hộ kinh doanh cá thể, hộ gia đình',
    icon: Store,
  },
];

const FEATURES = [
  { icon: Shield, text: 'Bảo mật thông tin tuyệt đối' },
  { icon: Clock,  text: 'Nhập liệu nhanh chóng, chính xác' },
  { icon: Download, text: 'Tải biểu mẫu đã điền sẵn về máy' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const [mucDich, setMucDich] = useState<MucDich | null>(null);
  const [doiTuong, setDoiTuong] = useState<DoiTuong | null>(null);

  const canProceed = mucDich !== null && doiTuong !== null;

  const handleSelectMucDich = (id: MucDich) => {
    setMucDich(id);
    // Cuộn mượt mà xuống Bước 2 trên thiết bị di động
    setTimeout(() => {
      const step2El = document.getElementById('step-2-section');
      if (step2El) {
        step2El.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleSelectDoiTuong = (id: DoiTuong) => {
    setDoiTuong(id);
    // Cuộn mượt mà xuống nút Bắt đầu
    setTimeout(() => {
      const ctaEl = document.getElementById('cta-section');
      if (ctaEl) {
        ctaEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleProceed = () => {
    if (!canProceed) return;
    const params = new URLSearchParams({ mucDich: mucDich!, doiTuong: doiTuong! });
    router.push(`/form?${params.toString()}`);
  };

  const selectedMucDich = MUC_DICH_OPTIONS.find((o) => o.id === mucDich);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="glass-header sticky top-0 z-40 w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 flex items-center">
              <Image
                src="/logo-bidv-hadong.png"
                alt="BIDV Chi nhánh Hà Đông"
                width={120}
                height={40}
                className="h-9 w-auto object-contain"
                priority
              />
            </div>
            <div className="border-l border-neutral-200 pl-3 hidden md:block">
              <p className="text-sm font-semibold text-bidv-teal leading-tight">
                Biểu mẫu Đăng ký / Thay đổi thông tin
              </p>
              <p className="text-xs text-neutral-500 leading-tight">
                Khách hàng tổ chức & Hộ kinh doanh
              </p>
            </div>
          </div>
          
          <Link
            href="/admin"
            className="btn-outline py-1.5 px-3 text-xs flex items-center gap-1.5 border border-neutral-200 text-neutral-600 hover:text-bidv-teal hover:border-bidv-teal/50 hover:bg-bidv-teal-light/45 rounded-lg transition-all shadow-sm"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Trang Quản trị</span>
          </Link>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        className="py-10 px-4 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(27,112,112,0.06) 0%, rgba(64,196,170,0.04) 50%, transparent 100%)',
        }}
      >
        <div
          className="max-w-2xl mx-auto space-y-3"
          style={{ animation: 'var(--animate-fade-in-up)' }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-bidv-teal-light text-bidv-teal-dark">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Cổng nhập liệu trực tuyến — BIDV Hà Đông
          </span>
          <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 tracking-tight">
            Đăng ký & Thay đổi thông tin
            <br />
            <span className="text-bidv-teal">tài khoản ngân hàng</span>
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed max-w-lg mx-auto">
            Nhập thông tin trực tuyến, hệ thống tự động điền vào biểu mẫu BIDV
            theo đúng định dạng — tải xuống và mang đến quầy giao dịch.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {FEATURES.map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-neutral-200 text-neutral-600 shadow-sm"
              >
                <Icon className="w-3.5 h-3.5 text-bidv-teal" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Selection ─────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pb-16">
        <div className="space-y-8">

          {/* Step 1: Mục đích */}
          <section style={{ animation: 'var(--animate-fade-in-up)', animationDelay: '0.1s', animationFillMode: 'both' }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-bidv-teal text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                1
              </span>
              <h2 className="text-base font-semibold text-neutral-900">
                Chọn mục đích
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {MUC_DICH_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = mucDich === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectMucDich(opt.id)}
                    className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 group ${
                      isSelected
                        ? 'border-bidv-teal bg-bidv-teal-light shadow-card'
                        : 'border-neutral-200 bg-white hover:border-bidv-teal/40 hover:bg-neutral-50 shadow-card'
                    }`}
                  >
                    {/* BM badge */}
                    <span
                      className={`absolute top-3 right-3 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-bidv-teal text-white' : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {opt.bm}
                    </span>

                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                        isSelected ? 'bg-bidv-teal' : 'bg-neutral-100 group-hover:bg-bidv-teal-light'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-bidv-teal'}`} />
                    </div>
                    <p className={`text-sm font-semibold leading-tight mb-1 ${isSelected ? 'text-bidv-teal-dark' : 'text-neutral-900'}`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-neutral-500 leading-snug">
                      {opt.sublabel}
                    </p>

                    {isSelected && (
                      <span className="absolute bottom-3 right-3">
                        <CheckCircle2 className="w-4 h-4 text-bidv-teal" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 2: Đối tượng (hiện ra sau khi chọn mục đích) */}
          {mucDich && (
            <section
              id="step-2-section"
              key={mucDich}
              style={{ animation: 'var(--animate-fade-in-up)' }}
              className="scroll-mt-20"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-bidv-teal text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  2
                </span>
                <h2 className="text-base font-semibold text-neutral-900">
                  Chọn loại hình khách hàng
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 card-perspective">
                {DOI_TUONG_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = doiTuong === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectDoiTuong(opt.id)}
                      className={`card-tilt text-left p-6 rounded-2xl border-2 transition-all duration-200 group ${
                        isSelected
                          ? 'border-bidv-teal bg-gradient-to-br from-bidv-teal-light to-white shadow-premium'
                          : 'border-neutral-200 bg-white hover:border-bidv-teal/40 shadow-card'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected ? 'bg-bidv-teal' : 'bg-neutral-100 group-hover:bg-bidv-teal-light'
                          }`}
                        >
                          <Icon className={`w-7 h-7 ${isSelected ? 'text-white' : 'text-bidv-teal'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-base font-semibold mb-1 ${isSelected ? 'text-bidv-teal-dark' : 'text-neutral-900'}`}>
                            {opt.label}
                          </p>
                          <p className="text-xs text-neutral-500 leading-relaxed">
                            {opt.sublabel}
                          </p>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-bidv-teal">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Đã chọn
                            </span>
                          )}
                        </div>
                        <ChevronRight
                          className={`w-5 h-5 flex-shrink-0 transition-colors mt-1 ${
                            isSelected ? 'text-bidv-teal' : 'text-neutral-300 group-hover:text-neutral-400'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* CTA Button */}
          {canProceed && (
            <section
              id="cta-section"
              style={{ animation: 'var(--animate-scale-up)' }}
              className="flex flex-col items-center gap-3 pt-2 scroll-mt-20"
            >
              {/* Summary badge */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-200 shadow-card text-xs text-neutral-500">
                <span className="font-semibold text-bidv-teal">
                  {selectedMucDich?.bm}
                </span>
                <span>—</span>
                <span>{selectedMucDich?.label}</span>
                <span>·</span>
                <span>{DOI_TUONG_OPTIONS.find((o) => o.id === doiTuong)?.label}</span>
              </div>

              <button
                onClick={handleProceed}
                className="btn-primary px-8 py-3 text-sm rounded-xl shadow-premium"
              >
                Bắt đầu nhập thông tin
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-neutral-400">
                Bạn có thể quay lại chỉnh sửa bất kỳ lúc nào trước khi tải biểu mẫu
              </p>
            </section>
          )}

        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-neutral-200 bg-white py-4 px-4">
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
