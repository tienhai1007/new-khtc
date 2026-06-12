'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Mật khẩu không chính xác.');
      }

      // Đăng nhập thành công, chuyển hướng về Dashboard
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-1 text-center">
        <p className="text-[11px] text-amber-800">
          <strong>Công cụ nội bộ</strong> BIDV Chi nhánh Hà Đông — không phải website chính thức.{' '}
          Trang chính thức:{' '}
          <a href="https://bidv.com.vn" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
            bidv.com.vn
          </a>
        </p>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
      <div
        className="max-w-md w-full bg-white rounded-3xl border border-neutral-200 shadow-premium p-8 space-y-8"
        style={{ animation: 'var(--animate-scale-up)' }}
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <span className="text-xl font-bold text-bidv-teal tracking-tight">
              BIDV Hà Đông
            </span>
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-neutral-900">
              Cổng Quản trị Hồ sơ
            </h1>
            <p className="text-xs text-neutral-500">
              Dành riêng cho Cán bộ nhân viên BIDV Chi nhánh Hà Đông
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700">
              Mật khẩu truy cập
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu quản trị..."
                disabled={isLoading}
                className="input-base !pl-10 pr-10 py-2.5"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="btn-primary w-full py-2.5 text-xs shadow-card"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xác thực...
              </>
            ) : (
              'Đăng nhập Hệ thống'
            )}
          </button>
        </form>

        {/* Security Alert Footer */}
        <div className="text-center pt-2 border-t border-neutral-100 space-y-3">
          <p className="text-[10px] text-neutral-400 leading-normal">
            Hệ thống nội bộ được bảo mật. Mọi hành vi truy cập trái phép sẽ bị ghi lại log và xử lý theo quy định của ngân hàng.
          </p>
          <div className="flex justify-center pt-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-bidv-teal font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
