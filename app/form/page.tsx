'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  Download,
  AlertCircle,
  CheckCircle2,
  Building2,
  Store,
  Loader2,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  UserCheck,
  FileCheck,
  Shield,
} from 'lucide-react';
import {
  BM01_STEPS,
  BM02_STEPS,
  filterSteps,
  WizardStep,
  FormField,
  NOI_CAP_CCCD_OPTIONS,
} from '@/lib/formConfig';

// ── Types ────────────────────────────────────────────────────────────────────

type MucDich = 'mo-moi' | 'thay-doi' | 'cap-lai-mat-khau';
type DoiTuong = 'khach-hang-to-chuc' | 'ho-kinh-doanh';

// ── Helper functions ─────────────────────────────────────────────────────────

function formatDataForOutput(
  raw: Record<string, string>,
  steps: WizardStep[]
): Record<string, string> {
  const formatted = { ...raw };
  steps.forEach((step) => {
    step.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.type === 'date' && formatted[field.key]) {
          const val = formatted[field.key];
          if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
            const [y, m, d] = val.split('-');
            formatted[field.key] = `${d}/${m}/${y}`;
          }
        }
      });
    });
  });
  return formatted;
}

// ── Main Wizard Component ────────────────────────────────────────────────────

function FormWizard() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mucDich = searchParams.get('mucDich') as MucDich;
  const doiTuong = searchParams.get('doiTuong') as DoiTuong;

  const [steps, setSteps] = useState<WizardStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // States nâng cao cho các yêu cầu mới
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    'd2-uq-chu-tk': false,
    'd3-ke-toan-truong': true, // Kế toán trưởng mặc định mở
    'd5-nguoi-gioi-thieu': false,
  });

  const [kttIsDdpL, setKttIsDdpL] = useState('no'); // Kế toán trưởng kiêm nhiệm
  const [activeUsersCount, setActiveUsersCount] = useState(1); // Số người dùng NHĐT hoạt động (1-3)

  // Lưu trữ tùy chọn người dùng NHĐT đã chọn điền tự động
  const [userAutoFillSource, setUserAutoFillSource] = useState<Record<string, string>>({
    user1: 'custom',
    user2: 'custom',
    user3: 'custom',
  });

  // Khởi tạo các bước và dữ liệu
  useEffect(() => {
    if (!mucDich || !doiTuong) return;

    const baseSteps = mucDich === 'cap-lai-mat-khau' ? BM02_STEPS : BM01_STEPS;
    const filtered = filterSteps(baseSteps, doiTuong);
    setSteps(filtered);

    // Khởi tạo formData
    const initialData: Record<string, string> = {};
    filtered.forEach((step) => {
      step.sections.forEach((sec) => {
        sec.fields.forEach((f) => {
          // Gán quốc tịch mặc định là Việt Nam
          if (f.key.endsWith('QUOC_TICH')) {
            initialData[f.key] = 'Việt Nam';
          } else {
            initialData[f.key] = '';
          }
        });
      });
    });

    // Thêm các trường phân quyền NHĐT
    initialData['USER1_NHOM_QUYEN'] = 'Tạo giao dịch';
    initialData['USER2_NHOM_QUYEN'] = 'Tạo giao dịch';
    initialData['USER3_NHOM_QUYEN'] = 'Tạo giao dịch';

    setFormData(initialData);
  }, [mucDich, doiTuong]);

  // Đồng bộ thông tin Kế toán trưởng kiêm nhiệm khi thay đổi toggle hoặc thông tin của NDDPL
  useEffect(() => {
    if (kttIsDdpL === 'yes' && mucDich !== 'cap-lai-mat-khau') {
      setFormData((prev) => ({
        ...prev,
        D3_HO_TEN: prev['NDDPL_HO_TEN'] || '',
        D3_CHUC_VU: 'Kế toán trưởng (Kiêm nhiệm)',
        D3_NGAY_SINH: prev['NDDPL_NGAY_SINH'] || '',
        D3_QUOC_TICH: prev['NDDPL_QUOC_TICH'] || 'Việt Nam',
        D3_CCCD_SO: prev['NDDPL_CCCD_SO'] || '',
        D3_CCCD_NGAY_CAP: prev['NDDPL_CCCD_NGAY_CAP'] || '',
        D3_CCCD_HET_HAN: prev['NDDPL_CCCD_HET_HAN'] || '',
        D3_CCCD_NOI_CAP: prev['NDDPL_CCCD_NOI_CAP'] || '',
        D3_SDT: prev['NDDPL_SDT'] || '',
        D3_EMAIL: prev['NDDPL_EMAIL'] || '',
        D3_DC_THUONG_TRU: prev['NDDPL_DC_THUONG_TRU'] || '',
      }));
    }
  }, [kttIsDdpL, formData['NDDPL_HO_TEN'], formData['NDDPL_CCCD_SO'], formData['NDDPL_SDT'], formData['NDDPL_EMAIL']]);

  // Nếu thiếu param, hiển thị thông báo quay lại trang chủ
  if (!mucDich || !doiTuong) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
        <div className="max-w-md w-full text-center space-y-4 p-8 bg-white rounded-2xl border border-neutral-200 shadow-card">
          <AlertCircle className="w-12 h-12 text-bidv-teal mx-auto" />
          <h2 className="text-lg font-semibold text-neutral-900">Thiếu thông tin đăng ký</h2>
          <p className="text-sm text-neutral-500">
            Vui lòng chọn mục đích và loại hình khách hàng tại trang chủ trước khi nhập thông tin.
          </p>
          <button onClick={() => router.push('/')} className="btn-primary w-full py-2.5">
            Quay lại Trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-bidv-teal animate-spin" />
          <p className="text-sm text-neutral-500">Đang tải cấu hình biểu mẫu...</p>
        </div>
      </div>
    );
  }

  const isLastStep = currentStepIdx === steps.length; // Bước cuối cùng là bước Hoàn thiện review

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // Toggle trạng thái mở của accordion (Bước 3)
  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Lấy danh sách tên người dùng có sẵn ở các bước trước để hiển thị trong Bước 4
  const getAutoFillOptions = () => {
    const list = [{ id: 'custom', name: 'Nhập thông tin khác (Tự nhập)' }];
    
    if (formData['NDDPL_HO_TEN']?.trim()) {
      list.push({ id: 'nddpl', name: `Chủ tài khoản: ${formData['NDDPL_HO_TEN']}` });
    }
    if (formData['D2_HO_TEN']?.trim()) {
      list.push({ id: 'd2', name: `Người ủy quyền: ${formData['D2_HO_TEN']}` });
    }
    if (formData['D3_HO_TEN']?.trim() && kttIsDdpL !== 'yes') {
      list.push({ id: 'd3', name: `Kế toán trưởng: ${formData['D3_HO_TEN']}` });
    }
    if (formData['D5_HO_TEN']?.trim()) {
      list.push({ id: 'd5', name: `Người giới thiệu: ${formData['D5_HO_TEN']}` });
    }

    return list;
  };

  // Xử lý tự động điền khi chọn nguồn thông tin trong Bước 4
  const handleUserAutoFill = (userPrefix: 'USER1' | 'USER2' | 'USER3', sourceId: string) => {
    const userKey = userPrefix.toLowerCase() as 'user1' | 'user2' | 'user3';
    setUserAutoFillSource((prev) => ({ ...prev, [userKey]: sourceId }));

    let sourcePrefix = '';
    if (sourceId === 'nddpl') sourcePrefix = 'NDDPL';
    else if (sourceId === 'd2') sourcePrefix = 'D2';
    else if (sourceId === 'd3') sourcePrefix = 'D3';
    else if (sourceId === 'd5') sourcePrefix = 'D5';

    if (sourcePrefix) {
      setFormData((prev) => ({
        ...prev,
        [`${userPrefix}_HO_TEN`]: prev[`${sourcePrefix}_HO_TEN`] || '',
        [`${userPrefix}_CCCD_SO`]: prev[sourcePrefix === 'D5' ? 'D5_CCCD_SO' : `${sourcePrefix}_CCCD_SO`] || '',
        [`${userPrefix}_CCCD_NGAY_CAP`]: prev[sourcePrefix === 'D5' ? 'D5_CCCD_NGAY_CAP' : `${sourcePrefix}_CCCD_NGAY_CAP`] || '',
        [`${userPrefix}_CCCD_HET_HAN`]: prev[sourcePrefix === 'D5' ? 'D5_CCCD_HET_HAN' : `${sourcePrefix}_CCCD_HET_HAN`] || '',
        [`${userPrefix}_CCCD_NOI_CAP`]: prev[sourcePrefix === 'D5' ? 'D5_CCCD_NOI_CAP' : `${sourcePrefix}_CCCD_NOI_CAP`] || '',
        [`${userPrefix}_QUOC_TICH`]: prev[`${sourcePrefix}_QUOC_TICH`] || 'Việt Nam',
        [`${userPrefix}_SDT`]: prev[`${sourcePrefix}_SDT`] || '',
        [`${userPrefix}_EMAIL`]: prev[sourcePrefix === 'D5' ? '' : `${sourcePrefix}_EMAIL`] || '',
      }));
    } else {
      // Clear thông tin nếu chọn 'custom'
      setFormData((prev) => ({
        ...prev,
        [`${userPrefix}_HO_TEN`]: '',
        [`${userPrefix}_CCCD_SO`]: '',
        [`${userPrefix}_CCCD_NGAY_CAP`]: '',
        [`${userPrefix}_CCCD_HET_HAN`]: '',
        [`${userPrefix}_CCCD_NOI_CAP`]: '',
        [`${userPrefix}_QUOC_TICH`]: 'Việt Nam',
        [`${userPrefix}_SDT`]: '',
        [`${userPrefix}_EMAIL`]: '',
      }));
    }
  };

  // Validate thông tin cho một step cụ thể
  const validateStep = (stepIdx: number): boolean => {
    // Nếu là bước Review Hoàn thiện, luôn hợp lệ
    if (stepIdx === steps.length) return true;

    const step = steps[stepIdx];
    const nextErrors: Record<string, string> = {};
    let isValid = true;

    step.sections.forEach((sec) => {
      // Nếu là bước NHĐT, chỉ validate các người dùng đang hoạt động (activeUsersCount)
      if (step.id === 'nguoi-dung-nhdt') {
        const isUser2 = sec.id === 'user2';
        const isUser3 = sec.id === 'user3';
        if (isUser2 && activeUsersCount < 2) return;
        if (isUser3 && activeUsersCount < 3) return;
      }

      // Nếu KTT kiêm nhiệm và là phần KTT, ta bỏ qua validate các trường bên dưới ngoại trừ họ tên và chức vụ
      const isKttSection = sec.id === 'd3-ke-toan-truong';
      
      sec.fields.forEach((f) => {
        // Bỏ qua validate trường không áp dụng khi kiêm nhiệm KTT
        if (isKttSection && kttIsDdpL === 'yes' && f.key !== 'D3_HO_TEN' && f.key !== 'D3_CHUC_VU') {
          return;
        }

        const val = (formData[f.key] || '').trim();

        // 1. Kiểm tra required
        if (f.required && !val) {
          nextErrors[f.key] = `Vui lòng nhập ${f.label.toLowerCase()}`;
          isValid = false;
        }

        // 2. Định dạng email/sđt/mst
        if (val) {
          if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            nextErrors[f.key] = 'Địa chỉ email không hợp lệ (VD: contact@company.com)';
            isValid = false;
          }
          if (f.type === 'tel' && !/^[0-9]{9,11}$/.test(val.replace(/\s+/g, ''))) {
            nextErrors[f.key] = 'Số điện thoại không hợp lệ (9 - 11 chữ số)';
            isValid = false;
          }
          if (f.key === 'MA_SO_THUE' && !/^[0-9]{10,13}$/.test(val.replace(/[^0-9]/g, ''))) {
            nextErrors[f.key] = 'Mã số thuế không hợp lệ (10 hoặc 13 chữ số)';
            isValid = false;
          }
        }
      });
    });

    setErrors(nextErrors);

    if (!isValid) {
      const firstErrorKey = Object.keys(nextErrors)[0];
      
      // Nếu trường lỗi nằm trong accordion bị đóng, hãy mở accordion đó ra
      if (step.id === 'uy-quyen') {
        if (firstErrorKey.startsWith('D2_')) {
          setOpenAccordions((prev) => ({ ...prev, 'd2-uq-chu-tk': true }));
        } else if (firstErrorKey.startsWith('D3_')) {
          setOpenAccordions((prev) => ({ ...prev, 'd3-ke-toan-truong': true }));
        } else if (firstErrorKey.startsWith('D5_')) {
          setOpenAccordions((prev) => ({ ...prev, 'd5-nguoi-gioi-thieu': true }));
        }
      }

      setTimeout(() => {
        const element = document.getElementById(`field-group-${firstErrorKey}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }

    return isValid;
  };

  const handleNext = () => {
    if (!validateStep(currentStepIdx)) return;

    if (currentStepIdx < steps.length) {
      setCurrentStepIdx((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/');
    }
  };

  // API Submit chính thức từ trang Review
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setSubmitError(null);

    // Dọn dẹp dữ liệu thừa của các user NHĐT không hoạt động trước khi gửi
    const cleanedFormData = { ...formData };
    if (activeUsersCount < 2) {
      Object.keys(cleanedFormData).forEach((k) => {
        if (k.startsWith('USER2_')) cleanedFormData[k] = '';
      });
    }
    if (activeUsersCount < 3) {
      Object.keys(cleanedFormData).forEach((k) => {
        if (k.startsWith('USER3_')) cleanedFormData[k] = '';
      });
    }

    // Chuẩn hoá ngày tháng sang định dạng dd/mm/yyyy trước khi gửi
    const finalData = formatDataForOutput(cleanedFormData, steps);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mucDich,
          doiTuong,
          data: finalData,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || 'Đã xảy ra lỗi trong quá trình xử lý hồ sơ.');
      }

      // Tự động tải xuống
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const cleanOrgName = (formData['TEN_TO_CHUC_VI'] || 'KieuMau')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 30);
      const prefix = mucDich === 'cap-lai-mat-khau' ? 'BM02' : 'BM01';
      a.download = `${prefix}_${cleanOrgName}.docx`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      sessionStorage.setItem('lastSubmission', JSON.stringify({
        mucDich,
        doiTuong,
        orgName: formData['TEN_TO_CHUC_VI'] || '',
        submittedAt: new Date().toISOString(),
      }));

      router.push(`/success?mucDich=${mucDich}&doiTuong=${doiTuong}`);
    } catch (err: any) {
      console.error('Submit error:', err);
      setSubmitError(err.message || 'Không thể kết nối đến máy chủ để tạo biểu mẫu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBannerInfo = () => {
    let mdText = '';
    let bmText = '';
    if (mucDich === 'mo-moi') {
      mdText = 'Đăng ký mở mới';
      bmText = 'BM01';
    } else if (mucDich === 'thay-doi') {
      mdText = 'Thay đổi thông tin';
      bmText = 'BM01';
    } else {
      mdText = 'Yêu cầu cấp lại mật khẩu';
      bmText = 'BM02';
    }
    const dtText = doiTuong === 'khach-hang-to-chuc' ? 'Khách hàng tổ chức' : 'Hộ kinh doanh';
    return { mdText, dtText, bmText };
  };

  const { mdText, dtText, bmText } = getBannerInfo();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="glass-header sticky top-0 z-40 w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
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
              <p className="text-sm font-semibold text-bidv-teal leading-tight">
                {mdText} ({bmText})
              </p>
              <p className="text-xs text-neutral-500 leading-tight">
                Dành cho: {dtText}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/admin')}
              className="btn-outline py-1.5 px-3 text-xs flex items-center gap-1.5 border border-neutral-200 text-neutral-600 hover:text-bidv-teal hover:border-bidv-teal/50 hover:bg-bidv-teal-light/45 rounded-lg transition-all shadow-sm"
            >
              <Shield className="w-3.5 h-3.5" />
              Trang Quản trị
            </button>
            <button
              onClick={() => router.push('/')}
              className="btn-outline py-1.5 px-3 text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </header>

      {/* ── Progress Bar ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-200 py-4 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Desktop Progress Bar (Thêm bước Hoàn thiện) */}
          <div className="hidden md:flex items-center justify-between">
            {steps.map((step, idx) => {
              const isActive = idx === currentStepIdx;
              const isDone = idx < currentStepIdx;
              return (
                <React.Fragment key={step.id}>
                  {idx > 0 && <div className={`step-line ${isDone ? 'done' : ''}`} />}
                  <div className="flex flex-col items-center gap-1.5 px-2">
                    <div className={`step-dot ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <span className={`text-xs font-medium whitespace-nowrap ${
                      isActive ? 'text-bidv-teal font-semibold' : 'text-neutral-500'
                    }`}>
                      {step.shortTitle}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
            <div className={`step-line ${currentStepIdx === steps.length ? 'done' : ''}`} />
            <div className="flex flex-col items-center gap-1.5 px-2">
              <div className={`step-dot ${currentStepIdx === steps.length ? 'active' : ''}`}>
                ✓
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${
                currentStepIdx === steps.length ? 'text-bidv-teal font-semibold' : 'text-neutral-500'
              }`}>
                Hoàn thiện
              </span>
            </div>
          </div>

          {/* Mobile Progress Info */}
          <div className="md:hidden flex items-center justify-between">
            <span className="text-xs font-semibold text-bidv-teal uppercase tracking-wider">
              Bước {currentStepIdx + 1} / {steps.length + 1}
            </span>
            <span className="text-sm font-semibold text-neutral-900">
              {currentStepIdx === steps.length ? 'Hoàn thiện & Kiểm tra' : steps[currentStepIdx].title}
            </span>
          </div>

          {/* Mobile Visual Progress Bar */}
          <div className="md:hidden w-full bg-neutral-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-bidv-teal h-full transition-all duration-300"
              style={{ width: `${((currentStepIdx + 1) / (steps.length + 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Main Form Area ─────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        
        {/* ── BƯỚC 5: TRANG REVIEW HOÀN THIỆN ─────────────────────────────────── */}
        {isLastStep ? (
          <div
            className="bg-white rounded-2xl border border-neutral-200 shadow-premium p-6 md:p-8 space-y-8"
            style={{ animation: 'var(--animate-scale-up)' }}
          >
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-bidv-teal-light text-bidv-teal text-xs font-bold">
                  ✓
                </span>
                Kiểm tra thông tin & Gửi hồ sơ
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Vui lòng xem kỹ lại toàn bộ dữ liệu đã nhập bên dưới trước khi thực hiện tải hồ sơ đăng ký.
              </p>
            </div>

            <div className="space-y-6">
              {steps.map((step, sIdx) => (
                <div key={step.id} className="border border-neutral-100 rounded-xl overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-bidv-teal-dark uppercase">
                      Bước {sIdx + 1} — {step.title}
                    </span>
                    <button
                      onClick={() => setCurrentStepIdx(sIdx)}
                      className="text-[11px] font-semibold text-bidv-teal hover:underline"
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                  
                  <div className="p-4 space-y-4 text-xs">
                    {step.id === 'uy-quyen' && kttIsDdpL === 'yes' && (
                      <div className="mb-2 p-2.5 bg-bidv-teal-light/40 border border-bidv-teal/10 rounded-lg text-bidv-teal-dark font-medium">
                        ✓ Kế toán trưởng kiêm nhiệm: Sử dụng thông tin của Người đại diện theo pháp luật
                      </div>
                    )}
                    
                    {step.sections.map((sec) => {
                      // Ẩn hiển thị review KTT nếu kiêm nhiệm và không có tên
                      if (step.id === 'uy-quyen' && sec.id === 'd3-ke-toan-truong' && kttIsDdpL === 'yes') {
                        return (
                          <div key={sec.id} className="space-y-1">
                            <span className="font-semibold text-neutral-800">{sec.title}</span>
                            <p className="text-neutral-500 italic">Kiêm nhiệm Chủ tài khoản / Người đại diện theo pháp luật.</p>
                          </div>
                        );
                      }
                      
                      // Ẩn hiển thị review người dùng NHĐT 2/3 nếu không active
                      if (step.id === 'nguoi-dung-nhdt') {
                        if (sec.id === 'user2' && activeUsersCount < 2) return null;
                        if (sec.id === 'user3' && activeUsersCount < 3) return null;
                      }

                      // Kiểm tra xem section có dữ liệu nào không
                      const hasData = sec.fields.some((f) => (formData[f.key] || '').trim());
                      if (!hasData) {
                        return (
                          <div key={sec.id} className="space-y-1">
                            <span className="font-semibold text-neutral-800">{sec.title}</span>
                            <p className="text-neutral-400 italic">Không đăng ký / Để trống</p>
                          </div>
                        );
                      }

                      return (
                        <div key={sec.id} className="space-y-2">
                          <span className="font-semibold text-neutral-800 block border-b border-neutral-50 pb-1">
                            {sec.title}
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-neutral-700">
                            {sec.fields.map((f) => {
                              const val = formData[f.key];
                              if (!val) return null;
                              
                              let displayVal = val;
                              if (f.type === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
                                const [y, m, d] = val.split('-');
                                displayVal = `${d}/${m}/${y}`;
                              }

                              return (
                                <div key={f.key} className="flex justify-between sm:justify-start gap-4">
                                  <span className="text-neutral-400 sm:w-1/2">{f.label}:</span>
                                  <span className="font-medium text-neutral-900 sm:w-1/2 break-all">{displayVal}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-red-900">Không thể tạo biểu mẫu</h4>
                  <p className="text-xs text-red-700 leading-relaxed">{submitError}</p>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between border-t border-neutral-100 pt-6">
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="btn-outline px-5 py-2.5 text-xs flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary px-6 py-2.5 text-xs flex items-center gap-2 shadow-premium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang gửi & tạo biểu mẫu...
                  </>
                ) : (
                  <>
                    Gửi đăng ký & Tải hồ sơ
                    <Download className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          
          /* ── CÁC BƯỚC FORM WIZARD CHÍNH ────────────────────────────────────── */
          <div
            key={steps[currentStepIdx].id}
            className="bg-white rounded-2xl border border-neutral-200 shadow-card p-6 md:p-8 space-y-8"
            style={{ animation: 'var(--animate-fade-in-up)' }}
          >
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-bidv-teal-light text-bidv-teal text-xs font-bold">
                  {currentStepIdx + 1}
                </span>
                {steps[currentStepIdx].title}
              </h2>
              {/* Thay đổi Subtitle riêng cho bước 4 NHĐT */}
              {steps[currentStepIdx].id === 'nguoi-dung-nhdt' ? (
                <p className="text-xs text-neutral-500 mt-1">
                  Đăng ký thông tin người dùng để sử dụng dịch vụ Ngân hàng điện tử - BIDV Direct. Vui lòng điền các thông tin dưới đây.
                </p>
              ) : (
                <p className="text-xs text-neutral-500 mt-1">
                  Vui lòng điền các thông tin dưới đây.
                </p>
              )}
            </div>

            <div className="space-y-8">
              {steps[currentStepIdx].sections.map((section) => {
                
                // ── BƯỚC 3 LAYOUT MỚI: ACCORDION BREAKDOWN (D.2, D.3, D.5) ──────
                if (steps[currentStepIdx].id === 'uy-quyen') {
                  const isExpanded = openAccordions[section.id] || false;
                  
                  return (
                    <div key={section.id} className="border border-neutral-200 rounded-xl overflow-hidden">
                      {/* Accordion Trigger Header */}
                      <button
                        type="button"
                        onClick={() => toggleAccordion(section.id)}
                        className={`w-full text-left px-5 py-4 flex items-center justify-between transition-colors bg-neutral-50 hover:bg-neutral-100/70 border-b border-neutral-200`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            section.id === 'd3-ke-toan-truong' ? 'bg-bidv-teal' : 'bg-neutral-400'
                          }`} />
                          <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                            {section.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {section.id !== 'd3-ke-toan-truong' && (
                            <span className="text-[10px] text-neutral-400 font-semibold bg-white border border-neutral-200 px-2 py-0.5 rounded-full">
                              Tùy chọn
                            </span>
                          )}
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
                        </div>
                      </button>

                      {/* Accordion Content */}
                      {isExpanded && (
                        <div className="p-5 space-y-5 bg-white border-t border-neutral-100">
                          {section.subtitle && (
                            <p className="text-xs text-neutral-500 italic pb-2">{section.subtitle}</p>
                          )}

                          {/* Xử lý kiêm nhiệm đặc biệt đối với Kế toán trưởng D.3 */}
                          {section.id === 'd3-ke-toan-truong' && (
                            <div className="p-4 bg-bidv-teal-light/50 border border-bidv-teal/20 rounded-xl space-y-3">
                              <label className="block text-xs font-bold text-bidv-teal-dark">
                                Doanh nghiệp kiêm nhiệm vị trí?
                              </label>
                              <div className="flex items-center gap-6 text-xs font-medium">
                                <label className="flex items-center gap-2 cursor-pointer text-neutral-800">
                                  <input
                                    type="radio"
                                    name="kttIsDdpL"
                                    value="yes"
                                    checked={kttIsDdpL === 'yes'}
                                    onChange={(e) => setKttIsDdpL(e.target.value)}
                                    className="w-4 h-4 accent-bidv-teal"
                                  />
                                  Kế toán trưởng cũng đồng thời là Người đại diện pháp luật / Chủ tài khoản
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-neutral-800">
                                  <input
                                    type="radio"
                                    name="kttIsDdpL"
                                    value="no"
                                    checked={kttIsDdpL === 'no'}
                                    onChange={(e) => setKttIsDdpL(e.target.value)}
                                    className="w-4 h-4 accent-bidv-teal"
                                  />
                                  Nhập thông tin Kế toán trưởng riêng biệt
                                </label>
                              </div>
                              {kttIsDdpL === 'yes' && (
                                <p className="text-[11px] text-bidv-teal font-medium">
                                  ✓ Hệ thống sẽ tự động sao chép toàn bộ thông tin định danh của Người đại diện pháp luật sang Kế toán trưởng khi xuất hồ sơ. Bạn không cần điền các thông tin bên dưới.
                                </p>
                              )}
                            </div>
                          )}

                          {/* Render Fields của section */}
                          {/* Ẩn các trường nhập liệu của KTT nếu chọn kiêm nhiệm */}
                          {!(section.id === 'd3-ke-toan-truong' && kttIsDdpL === 'yes') && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {section.fields.map((field) => {
                                const hasError = !!errors[field.key];
                                const isFullWidth = field.type === 'textarea' || field.key.includes('DIA_CHI') || field.key.includes('THUONG_TRU');

                                return (
                                  <div
                                    key={field.key}
                                    id={`field-group-${field.key}`}
                                    className={`space-y-1.5 ${isFullWidth ? 'md:col-span-2' : ''}`}
                                  >
                                    <label className="block text-xs font-semibold text-neutral-800">
                                      {field.label}
                                      {field.required && (
                                        <span className="text-red-500 ml-1 font-bold">*</span>
                                      )}
                                    </label>

                                    {field.type === 'textarea' ? (
                                      <textarea
                                        id={field.key}
                                        value={formData[field.key] || ''}
                                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                                        placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}`}
                                        rows={3}
                                        className={`input-base resize-none ${hasError ? 'border-red-500 focus:border-red-500' : ''}`}
                                      />
                                    ) : field.type === 'select' ? (
                                      <select
                                        id={field.key}
                                        value={formData[field.key] || ''}
                                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                                        className={`input-base bg-no-repeat bg-right ${hasError ? 'border-red-500 focus:border-red-500' : ''}`}
                                      >
                                        <option value="">-- Chọn {field.label.toLowerCase()} --</option>
                                        {field.options?.map((opt) => (
                                          <option key={opt} value={opt}>
                                            {opt}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <input
                                        id={field.key}
                                        type={field.type}
                                        value={formData[field.key] || ''}
                                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                                        placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}`}
                                        className={`input-base ${hasError ? 'border-red-500 focus:border-red-500' : ''}`}
                                      />
                                    )}

                                    {hasError ? (
                                      <p className="text-[11px] text-red-600 flex items-center gap-1 font-medium">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600" />
                                        {errors[field.key]}
                                      </p>
                                    ) : field.helperText ? (
                                      <p className="text-[11px] text-neutral-500 leading-normal">
                                        {field.helperText}
                                      </p>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                // ── BƯỚC 4: NGÂN HÀNG ĐIỆN TỬ LAYOUT ĐỘNG ────────────────────────
                if (steps[currentStepIdx].id === 'nguoi-dung-nhdt') {
                  const isUser2 = section.id === 'user2';
                  const isUser3 = section.id === 'user3';
                  
                  // Chỉ hiển thị số người dùng đang active
                  if (isUser2 && activeUsersCount < 2) return null;
                  if (isUser3 && activeUsersCount < 3) return null;

                  const userPrefix = section.id.toUpperCase() as 'USER1' | 'USER2' | 'USER3';
                  const userKey = section.id.toLowerCase() as 'user1' | 'user2' | 'user3';

                  return (
                    <div key={section.id} className="space-y-6 border-t border-neutral-100 pt-6 first:border-0 first:pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-5 h-5 text-bidv-teal" />
                          <h3 className="text-sm font-bold text-neutral-900 tracking-wide uppercase">
                            {section.title}
                          </h3>
                        </div>
                        {userKey !== 'user1' && (
                          <button
                            type="button"
                            onClick={() => setActiveUsersCount((prev) => prev - 1)}
                            className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Xóa người dùng này
                          </button>
                        )}
                      </div>

                      {/* Tự động điền (Auto-fill dropdown) */}
                      <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-neutral-800">
                            Điền nhanh từ danh sách thông tin đã nhập
                          </label>
                          <p className="text-[10px] text-neutral-500 leading-normal">
                            Chọn người có sẵn bên dưới để điền nhanh thông tin mà không cần nhập lại.
                          </p>
                        </div>
                        <div>
                          <select
                            value={userAutoFillSource[userKey]}
                            onChange={(e) => handleUserAutoFill(userPrefix, e.target.value)}
                            className="input-base bg-no-repeat bg-right"
                          >
                            {getAutoFillOptions().map((opt) => (
                              <option key={opt.id} value={opt.id}>
                                {opt.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Phân nhóm quyền (Yêu cầu bổ sung) */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-neutral-800">
                          Nhóm quyền sử dụng dịch vụ <span className="text-red-500 font-bold">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {['Tạo giao dịch', 'Duyệt giao dịch', 'Vừa tạo vừa duyệt'].map((quyen) => {
                            const currentQuyen = formData[`${userPrefix}_NHOM_QUYEN`] || 'Tạo giao dịch';
                            const isSelected = currentQuyen === quyen;
                            return (
                              <button
                                key={quyen}
                                type="button"
                                onClick={() => handleInputChange(`${userPrefix}_NHOM_QUYEN`, quyen)}
                                className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-all ${
                                  isSelected
                                    ? 'bg-bidv-teal-light text-bidv-teal-dark border-bidv-teal font-semibold shadow-sm'
                                    : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                                }`}
                              >
                                {quyen}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Render fields định danh */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.fields.map((field) => {
                          const hasError = !!errors[field.key];
                          const isFullWidth = field.type === 'textarea';

                          return (
                            <div
                              key={field.key}
                              id={`field-group-${field.key}`}
                              className={`space-y-1.5 ${isFullWidth ? 'md:col-span-2' : ''}`}
                            >
                              <label className="block text-xs font-semibold text-neutral-800">
                                {field.label}
                                {field.required && (
                                  <span className="text-red-500 ml-1 font-bold">*</span>
                                )}
                              </label>

                              {field.type === 'textarea' ? (
                                <textarea
                                  id={field.key}
                                  value={formData[field.key] || ''}
                                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                                  placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}`}
                                  rows={3}
                                  disabled={userAutoFillSource[userKey] !== 'custom'}
                                  className={`input-base resize-none ${hasError ? 'border-red-500 focus:border-red-500' : ''}`}
                                />
                              ) : field.type === 'select' ? (
                                <select
                                  id={field.key}
                                  value={formData[field.key] || ''}
                                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                                  disabled={userAutoFillSource[userKey] !== 'custom'}
                                  className={`input-base bg-no-repeat bg-right ${hasError ? 'border-red-500 focus:border-red-500' : ''}`}
                                >
                                  <option value="">-- Chọn {field.label.toLowerCase()} --</option>
                                  {field.options?.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  id={field.key}
                                  type={field.type}
                                  value={formData[field.key] || ''}
                                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                                  placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}`}
                                  disabled={userAutoFillSource[userKey] !== 'custom'}
                                  className={`input-base ${hasError ? 'border-red-500 focus:border-red-500' : ''}`}
                                />
                              )}

                              {hasError ? (
                                <p className="text-[11px] text-red-600 flex items-center gap-1 font-medium">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600" />
                                  {errors[field.key]}
                                </p>
                              ) : field.helperText ? (
                                <p className="text-[11px] text-neutral-500 leading-normal">
                                  {field.helperText}
                                </p>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // ── MẶC ĐỊNH CHO CÁC BƯỚC 1 VÀ BƯỚC 2 ────────────────────────────
                return (
                  <div key={section.id} className="space-y-4 border-t border-neutral-100 pt-6 first:border-0 first:pt-0">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 tracking-wide uppercase">
                        {section.title}
                      </h3>
                      {section.subtitle && (
                        <p className="text-xs text-neutral-500 mt-0.5">{section.subtitle}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.fields.map((field) => {
                        const hasError = !!errors[field.key];
                        const isFullWidth = field.type === 'textarea' || field.key.includes('DIA_CHI') || field.key.includes('THUONG_TRU');

                        return (
                          <div
                            key={field.key}
                            id={`field-group-${field.key}`}
                            className={`space-y-1.5 ${isFullWidth ? 'md:col-span-2' : ''}`}
                          >
                            <label className="block text-xs font-medium text-neutral-800">
                              {field.label}
                              {field.required && (
                                <span className="text-red-500 ml-1 font-bold">*</span>
                              )}
                            </label>

                            {field.type === 'textarea' ? (
                              <textarea
                                id={field.key}
                                value={formData[field.key] || ''}
                                onChange={(e) => handleInputChange(field.key, e.target.value)}
                                placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}`}
                                rows={3}
                                className={`input-base resize-none ${hasError ? 'border-red-500 focus:border-red-500' : ''}`}
                              />
                            ) : field.type === 'select' ? (
                              <select
                                id={field.key}
                                value={formData[field.key] || ''}
                                onChange={(e) => handleInputChange(field.key, e.target.value)}
                                className={`input-base bg-no-repeat bg-right ${hasError ? 'border-red-500 focus:border-red-500' : ''}`}
                              >
                                <option value="">-- Chọn {field.label.toLowerCase()} --</option>
                                {field.options?.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                id={field.key}
                                type={field.type}
                                value={formData[field.key] || ''}
                                onChange={(e) => handleInputChange(field.key, e.target.value)}
                                placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}`}
                                className={`input-base ${hasError ? 'border-red-500 focus:border-red-500' : ''}`}
                              />
                            )}

                            {hasError ? (
                              <p className="text-[11px] text-red-600 flex items-center gap-1 font-medium">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600" />
                                {errors[field.key]}
                              </p>
                            ) : field.helperText ? (
                              <p className="text-[11px] text-neutral-500 leading-normal">
                                {field.helperText}
                              </p>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Nút bổ sung thêm người dùng dịch vụ NHĐT ở cuối Bước 4 */}
              {steps[currentStepIdx].id === 'nguoi-dung-nhdt' && activeUsersCount < 3 && (
                <div className="pt-2 border-t border-neutral-100 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setActiveUsersCount((prev) => prev + 1)}
                    className="btn-outline px-4 py-2 text-xs flex items-center gap-2 border-dashed border-bidv-teal text-bidv-teal hover:bg-bidv-teal-light"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm người dùng dịch vụ Ngân hàng điện tử (Tối đa 3)
                  </button>
                </div>
              )}
            </div>

            {/* Wizard Navigation */}
            <div className="flex items-center justify-between border-t border-neutral-100 pt-6">
              <button
                type="button"
                onClick={handleBack}
                className="btn-outline px-5 py-2.5 text-xs flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {currentStepIdx === 0 ? 'Quay về trang chủ' : 'Quay lại'}
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="btn-primary px-6 py-2.5 text-xs flex items-center gap-2"
              >
                Tiếp tục
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
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

export default function FormPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-bidv-teal animate-spin" />
            <p className="text-sm text-neutral-500">Đang tải biểu mẫu...</p>
          </div>
        </div>
      }
    >
      <FormWizard />
    </Suspense>
  );
}
