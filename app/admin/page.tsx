'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  Filter,
  Download,
  Eye,
  LogOut,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle,
  X,
  FileText,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  ClipboardCopy,
  Check,
} from 'lucide-react';
import { SubmissionRecord, GetSubmissionsResponse } from '@/lib/sheetsApi';

export default function AdminDashboardPage() {
  const router = useRouter();
  
  // State quản lý dữ liệu
  const [data, setData] = useState<GetSubmissionsResponse>({ BM01: [], BM02: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigError, setIsConfigError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Bộ lọc & Tìm kiếm
  const [activeTab, setActiveTab] = useState<'BM01' | 'BM02'>('BM01');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDoiTuong, setFilterDoiTuong] = useState<string>('all');
  const [filterMucDich, setFilterMucDich] = useState<string>('all');

  // Xem chi tiết & Download
  const [selectedRecord, setSelectedRecord] = useState<SubmissionRecord | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch dữ liệu từ API
  const fetchSubmissions = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    setIsConfigError(false);

    try {
      const res = await fetch('/api/admin/submissions');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.message || 'Không thể lấy dữ liệu từ Google Sheets.');
        if (json.isConfigError) {
          setIsConfigError(true);
        }
        if (json.data) {
          setData(json.data);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi kết nối đến máy chủ.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Xử lý Đăng xuất
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Lỗi khi đăng xuất:', err);
    }
  };

  // Xử lý Download file docx
  const handleDownload = async (record: SubmissionRecord, templateId: 'BM01' | 'BM02') => {
    const uniqueId = `${templateId}-${record._rowId}`;
    setDownloadingId(uniqueId);

    try {
      // Loại bỏ các trường hệ thống không thuộc placeholder
      const cleanData: any = { ...record };
      delete cleanData._rowId;
      delete cleanData.SYSTEM_TIMESTAMP;
      delete cleanData.SYSTEM_MUC_DICH;
      delete cleanData.SYSTEM_DOI_TUONG;

      const res = await fetch('/api/admin/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          data: cleanData,
        }),
      });

      if (!res.ok) {
        throw new Error('Sinh file thất bại.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Đọc header Content-Disposition để lấy tên file thực tế (nếu có)
      const disposition = res.headers.get('Content-Disposition');
      let fileName = `${templateId}_HoSo.docx`;
      if (disposition && disposition.indexOf('filename=') !== -1) {
        const parts = disposition.split('filename=');
        fileName = decodeURIComponent(parts[1].replace(/['"]/g, ''));
      } else {
        const orgName = (record.TEN_TO_CHUC_VI || 'KH')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9]/g, '_');
        fileName = `${templateId}_${orgName}.docx`;
      }

      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Không thể tải biểu mẫu. Vui lòng kiểm tra lại kết nối mạng.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Lọc dữ liệu theo tab và bộ lọc
  const getFilteredData = () => {
    const list = data[activeTab] || [];
    
    return list.filter((item) => {
      // 1. Lọc theo thanh tìm kiếm (Tên tổ chức, MST, hoặc Số CCCD/Giấy tờ)
      const searchStr = `${item.TEN_TO_CHUC_VI || ''} ${item.MA_SO_THUE || ''} ${item.SO_GIAY_TO_PHAP_LY || ''} ${item.NDDPL_HO_TEN || ''}`.toLowerCase();
      const matchSearch = searchStr.includes(searchTerm.toLowerCase().trim());

      // 2. Lọc theo đối tượng
      const matchDoiTuong = filterDoiTuong === 'all' || item.SYSTEM_DOI_TUONG === filterDoiTuong;

      // 3. Lọc theo mục đích
      const matchMucDich = filterMucDich === 'all' || item.SYSTEM_MUC_DICH === filterMucDich;

      return matchSearch && matchDoiTuong && matchMucDich;
    });
  };

  const filteredList = getFilteredData();

  // Định dạng ngày hiển thị hệ thống
  const formatTimestamp = (ts: string) => {
    if (!ts) return 'N/A';
    try {
      const date = new Date(ts);
      if (isNaN(date.getTime())) return ts; // Trả về text gốc nếu là ngày từ import
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return ts;
    }
  };

  // Đọc nhãn hiển thị cho Mục đích & Đối tượng
  const getBadgeLabels = (item: SubmissionRecord) => {
    let mdLabel = 'Đăng ký';
    let mdClass = 'badge-teal';
    if (item.SYSTEM_MUC_DICH === 'mo-moi') {
      mdLabel = 'Mở mới';
      mdClass = 'badge-teal';
    } else if (item.SYSTEM_MUC_DICH === 'thay-doi') {
      mdLabel = 'Thay đổi';
      mdClass = 'badge-gold';
    } else if (item.SYSTEM_MUC_DICH === 'cap-lai-mat-khau') {
      mdLabel = 'Cấp lại MK';
      mdClass = 'badge-mint';
    }

    const dtLabel = item.SYSTEM_DOI_TUONG === 'khach-hang-to-chuc' ? 'KHTC' : 'HKD';
    return { mdLabel, mdClass, dtLabel };
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="glass-header sticky top-0 z-40 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-bidv-hadong.png"
              alt="BIDV Chi nhánh Hà Đông"
              width={110}
              height={36}
              className="h-8 w-auto object-contain"
              priority
            />
            <div className="border-l border-neutral-200 pl-3">
              <span className="text-xs font-semibold text-bidv-teal-dark block">HỆ THỐNG QUẢN TRỊ HỒ SƠ</span>
              <span className="text-[10px] text-neutral-500 block">BIDV Hà Đông — Biểu mẫu KHTC/HKD</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchSubmissions(true)}
              disabled={loading || refreshing}
              className="btn-outline p-2 text-neutral-600 hover:text-bidv-teal flex items-center gap-1.5 text-xs rounded-lg"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Làm mới</span>
            </button>

            <button
              onClick={handleLogout}
              className="btn-outline border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 p-2 flex items-center gap-1.5 text-xs rounded-lg"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Container ─────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Hướng dẫn setup Google Sheets nếu chưa kết nối thành công */}
        {isConfigError && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-amber-900">
                  Hệ thống chưa được kết nối với Google Sheets!
                </h3>
                <p className="text-xs text-amber-700 leading-relaxed mt-1">
                  Mặc dù người dùng vẫn có thể tải biểu mẫu đã điền sẵn, nhưng dữ liệu thông tin chưa được lưu trữ tập trung trên Google Sheet của chi nhánh do thiếu cấu hình backend. Vui lòng thực hiện các bước sau để kết nối:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-9 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-amber-100 space-y-1">
                <span className="font-semibold text-bidv-teal">BƯỚC 1: Dán Apps Script</span>
                <p className="text-neutral-500 leading-normal">
                  Mở Google Sheet của chi nhánh, chọn <strong>Tiện ích mở rộng → Apps Script</strong>. Copy toàn bộ code trong file <code>server/Code.gs</code> của dự án này dán vào và lưu lại.
                </p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-amber-100 space-y-1">
                <span className="font-semibold text-bidv-teal">BƯỚC 2: Triển khai Web App</span>
                <p className="text-neutral-500 leading-normal">
                  Click nút <strong>Triển khai (Deploy) → Triển khai mới</strong>. Chọn loại là <strong>Ứng dụng web</strong>, cấu hình chạy dưới danh nghĩa <strong>Tôi (Me)</strong>, quyền truy cập là <strong>Bất kỳ ai (Anyone)</strong>. Tiến hành deploy và copy URL được tạo ra.
                </p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-amber-100 space-y-1">
                <span className="font-semibold text-bidv-teal">BƯỚC 3: Cập nhật biến .env</span>
                <p className="text-neutral-500 leading-normal">
                  Dán URL đó vào tệp <code>.env</code> ở máy chủ/Vercel với biến <code>GOOGLE_SCRIPT_URL</code>. Khởi động lại ứng dụng Next.js để hoàn tất.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Stats & Tabs ───────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Tab Selector */}
          <div className="bg-white p-1 rounded-xl border border-neutral-200 flex flex-wrap gap-1 w-full sm:w-auto">
            <button
              onClick={() => {
                setActiveTab('BM01');
                setFilterMucDich('all');
              }}
              className={`px-3 py-2 md:px-4 md:py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 flex-1 sm:flex-none ${
                activeTab === 'BM01'
                  ? 'bg-bidv-teal text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              Đăng ký / Thay đổi (BM01)
              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                activeTab === 'BM01' ? 'bg-bidv-teal-dark text-white' : 'bg-neutral-100 text-neutral-600'
              }`}>
                {data.BM01?.length || 0}
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab('BM02');
                setFilterMucDich('all');
              }}
              className={`px-3 py-2 md:px-4 md:py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 flex-1 sm:flex-none ${
                activeTab === 'BM02'
                  ? 'bg-bidv-teal text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              Cấp lại mật khẩu NHĐT (BM02)
              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                activeTab === 'BM02' ? 'bg-bidv-teal-dark text-white' : 'bg-neutral-100 text-neutral-600'
              }`}>
                {data.BM02?.length || 0}
              </span>
            </button>
          </div>
        </div>

        {/* ── Filters Bar ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
          
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo Tên tổ chức, MST, CCCD..."
              className="input-base pl-9 py-2 text-xs"
            />
          </div>

          {/* Đối tượng Filter */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 pointer-events-none">
              <Building2 className="w-3.5 h-3.5" />
            </span>
            <select
              value={filterDoiTuong}
              onChange={(e) => setFilterDoiTuong(e.target.value)}
              className="input-base pl-8 py-2 text-xs bg-no-repeat bg-right"
            >
              <option value="all">Tất cả Đối tượng</option>
              <option value="khach-hang-to-chuc">Khách hàng tổ chức</option>
              <option value="ho-kinh-doanh">Hộ kinh doanh</option>
            </select>
          </div>

          {/* Mục đích Filter (chỉ có ở BM01) */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 pointer-events-none">
              <Filter className="w-3.5 h-3.5" />
            </span>
            <select
              value={filterMucDich}
              onChange={(e) => setFilterMucDich(e.target.value)}
              disabled={activeTab === 'BM02'}
              className="input-base pl-8 py-2 text-xs bg-no-repeat bg-right disabled:opacity-50"
            >
              <option value="all">Tất cả Mục đích</option>
              <option value="mo-moi">Đăng ký mở mới</option>
              <option value="thay-doi">Thay đổi thông tin</option>
            </select>
          </div>
        </div>

        {/* ── Submissions Table ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-card">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-bidv-teal animate-spin" />
              <p className="text-xs text-neutral-500">Đang tải hồ sơ đăng ký...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <FileSpreadsheet className="w-12 h-12 text-neutral-300 mx-auto" />
              <h3 className="text-sm font-semibold text-neutral-900">Không có hồ sơ nào</h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Không tìm thấy thông tin phù hợp với điều kiện tìm kiếm hoặc bộ lọc hiện tại.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse data-table">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center hidden md:table-cell">STT</th>
                    <th className="py-3 px-4 hidden lg:table-cell">Thời gian gửi</th>
                    <th className="py-3 px-4">Tên Tổ chức / Hộ KD</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Mã số thuế / Giấy tờ</th>
                    <th className="py-3 px-4 hidden md:table-cell">Đại diện pháp luật</th>
                    <th className="py-3 px-4 text-center">Phân loại</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs text-neutral-900">
                  {filteredList.map((item, index) => {
                    const { mdLabel, mdClass, dtLabel } = getBadgeLabels(item);
                    const docxId = `${activeTab}-${item._rowId}`;

                    return (
                      <tr key={item._rowId} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3.5 px-4 text-center font-medium text-neutral-400 hidden md:table-cell">
                          {index + 1}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap hidden lg:table-cell">
                          {formatTimestamp(item.SYSTEM_TIMESTAMP)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold max-w-xs truncate">
                          {item.TEN_TO_CHUC_VI}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-neutral-600 hidden sm:table-cell">
                          {item.MA_SO_THUE || item.SO_GIAY_TO_PHAP_LY || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-700 hidden md:table-cell">
                          {item.NDDPL_HO_TEN || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-center space-y-1">
                          <span className={`badge ${mdClass} mr-1.5`}>{mdLabel}</span>
                          <span className="badge bg-neutral-100 text-neutral-700">{dtLabel}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex gap-1.5">
                            <button
                              onClick={() => setSelectedRecord(item)}
                              className="btn-outline p-1.5 text-neutral-600 hover:text-bidv-teal rounded-md"
                              title="Xem chi tiết hồ sơ"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDownload(item, activeTab)}
                              disabled={downloadingId === docxId}
                              className="btn-primary p-1.5 rounded-md shadow-sm disabled:opacity-50"
                              title="Tải biểu mẫu điền sẵn"
                            >
                              {downloadingId === docxId ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Download className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── Modal: Xem chi tiết hồ sơ ───────────────────────────────────────── */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-3xl border border-neutral-200 shadow-premium w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            style={{ animation: 'var(--animate-scale-up)' }}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-bidv-teal" />
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">Chi tiết dữ liệu biểu mẫu</h3>
                  <p className="text-[10px] text-neutral-500">Mã dòng sheet: #{selectedRecord._rowId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 hover:bg-neutral-200 rounded-full text-neutral-500 hover:text-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar">
              {/* Cảnh báo hệ thống */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-neutral-500 block">Thời điểm gửi trực tuyến:</span>
                  <span className="text-neutral-800 font-medium block mt-0.5">
                    {formatTimestamp(selectedRecord.SYSTEM_TIMESTAMP)}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Phân loại & Biểu mẫu:</span>
                  <span className="text-neutral-800 font-medium block mt-0.5">
                    {activeTab} ({selectedRecord.SYSTEM_MUC_DICH === 'mo-moi' ? 'Mở mới' : selectedRecord.SYSTEM_MUC_DICH === 'thay-doi' ? 'Thay đổi' : 'Cấp lại mật khẩu'}) — {selectedRecord.SYSTEM_DOI_TUONG === 'khach-hang-to-chuc' ? 'KHTC' : 'HKD'}
                  </span>
                </div>
              </div>

              {/* Data Sections */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-100 pb-1">
                  Nội dung nhập liệu chi tiết
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                  {Object.entries(selectedRecord)
                    .filter(([key]) => !key.startsWith('SYSTEM_') && !key.startsWith('_'))
                    .map(([key, value]) => (
                      <div key={key} className="space-y-0.5 border-b border-neutral-50 pb-2">
                        <span className="text-neutral-500 block font-medium">{key}</span>
                        <span className="text-neutral-900 font-semibold block break-all">
                          {value !== undefined && value !== null && value !== '' ? String(value) : '—'}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
              <span className="text-[10px] text-neutral-400">© 2026 BIDV Chi nhánh Hà Đông</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="btn-outline px-4 py-2 text-xs"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    handleDownload(selectedRecord, activeTab);
                    setSelectedRecord(null);
                  }}
                  className="btn-primary px-4 py-2 text-xs shadow-card flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải Biểu mẫu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-neutral-200 bg-white py-4 px-4 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-neutral-400">
            © 2026 BIDV Chi nhánh Hà Đông — Hệ thống quản trị nội bộ
          </p>
          <p className="text-xs text-neutral-400">
            197 Quang Trung, Hà Đông, Hà Nội
          </p>
        </div>
      </footer>
    </div>
  );
}
