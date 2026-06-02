/**
 * formConfig.ts — Cấu hình tất cả trường dữ liệu của form.
 * Mỗi field định nghĩa: key (= placeholder trong .docx), label, loại input,
 * bắt buộc hay không, và áp dụng cho loại hình nào.
 *
 * Scope:
 *  - 'both'   : cả KHTC (tổ chức) lẫn HKD (hộ kinh doanh)
 *  - 'khtc'   : chỉ KHTC (phần D — ủy quyền, kế toán trưởng…)
 *  - 'hkd'    : chỉ HKD (hiện tại không có trường riêng)
 */

export type FieldScope = 'both' | 'khtc' | 'hkd';
export type FieldType =
  | 'text'
  | 'date'    // dd/mm/yyyy
  | 'email'
  | 'tel'
  | 'textarea'
  | 'select';

export interface FormField {
  key: string;          // Tên placeholder trong .docx
  label: string;        // Label hiển thị trên form
  type: FieldType;
  required: boolean;
  scope: FieldScope;
  placeholder?: string; // Hint text trong input
  options?: string[];   // Cho type='select'
  helperText?: string;  // Gợi ý phụ bên dưới input
}

export interface FormSection {
  id: string;
  title: string;
  subtitle?: string;
  scope: FieldScope;
  fields: FormField[];
}

export interface WizardStep {
  id: string;
  title: string;
  shortTitle: string;   // Hiển thị trên progress bar
  scope: FieldScope;
  sections: FormSection[];
}

// Danh sách nơi cấp CCCD chuẩn
export const NOI_CAP_CCCD_OPTIONS = [
  'Bộ Công An',
  'Cục QlXNC',
  'CCS QLHCVTTXH'
];

// ─────────────────────────────────────────────────────────────────────────────
// BM01 — Đăng ký mở mới / Thay đổi thông tin
// ─────────────────────────────────────────────────────────────────────────────

export const BM01_STEPS: WizardStep[] = [
  // ── Bước 1: Thông tin tổ chức ─────────────────────────────────────────────
  {
    id: 'to-chuc',
    title: 'Thông tin tổ chức / Hộ kinh doanh',
    shortTitle: 'Tổ chức',
    scope: 'both',
    sections: [
      {
        id: 'a1-co-ban',
        title: 'A.I.1 — Thông tin cơ bản',
        scope: 'both',
        fields: [
          {
            key: 'TEN_TO_CHUC_VI',
            label: 'Tên tổ chức (tiếng Việt)',
            type: 'text',
            required: false,
            scope: 'both',
            placeholder: 'Công ty TNHH / Hộ kinh doanh ...',
          },
          {
            key: 'TEN_TO_CHUC_EN',
            label: 'Tên tổ chức (tiếng nước ngoài)',
            type: 'text',
            required: false,
            scope: 'both',
            placeholder: 'Nếu có',
          },
          {
            key: 'TEN_VIET_TAT',
            label: 'Tên viết tắt',
            type: 'text',
            required: false,
            scope: 'both',
            placeholder: 'VD: BIDV, VCB...',
          },
          {
            key: 'MA_SO_THUE',
            label: 'Mã số thuế',
            type: 'text',
            required: false,
            scope: 'both',
            placeholder: '10 hoặc 13 chữ số',
          },
          {
            key: 'LOAI_HINH_DN',
            label: 'Loại hình đăng ký doanh nghiệp',
            type: 'text',
            required: false,
            scope: 'both',
            placeholder: 'TNHH, Cổ phần, Tư nhân...',
          },
          {
            key: 'LINH_VUC_KD',
            label: 'Lĩnh vực hoạt động, kinh doanh',
            type: 'text',
            required: false,
            scope: 'both',
            placeholder: 'VD: Thương mại, Sản xuất, Dịch vụ...',
          },
          {
            key: 'QUY_MO_DN',
            label: 'Quy mô doanh nghiệp',
            type: 'select',
            required: false,
            scope: 'khtc',
            options: ['Siêu nhỏ', 'Nhỏ', 'Vừa', 'Lớn'],
          },
        ],
      },
      {
        id: 'a1-giay-to',
        title: 'Giấy tờ pháp lý',
        scope: 'both',
        fields: [
          {
            key: 'SO_GIAY_TO_PHAP_LY',
            label: 'Số giấy tờ pháp lý',
            type: 'text',
            required: false,
            scope: 'both',
            helperText: 'GCNĐKDN / GĐKKD / Quyết định thành lập / Giấy phép hoạt động',
          },
          {
            key: 'NGAY_CAP_LAN_DAU',
            label: 'Ngày cấp lần đầu',
            type: 'text',
            required: false,
            scope: 'both',
            placeholder: 'dd/mm/yyyy',
          },
          {
            key: 'NGAY_DIEU_CHINH',
            label: 'Ngày điều chỉnh gần nhất',
            type: 'text',
            required: false,
            scope: 'both',
            placeholder: 'dd/mm/yyyy',
          },
          {
            key: 'NOI_CAP_GIAY_TO',
            label: 'Nơi cấp',
            type: 'text',
            required: false,
            scope: 'both',
            placeholder: 'Sở KH&ĐT TP Hà Nội...',
          },
        ],
      },
      {
        id: 'a1-lien-lac',
        title: 'Thông tin liên lạc & địa chỉ',
        scope: 'both',
        fields: [
          {
            key: 'DIA_CHI_TRU_SO',
            label: 'Địa chỉ trụ sở chính',
            type: 'textarea',
            required: false,
            scope: 'both',
          },
          {
            key: 'DIA_CHI_GIAO_DICH',
            label: 'Địa chỉ giao dịch',
            type: 'textarea',
            required: false,
            scope: 'both',
            helperText: 'Điền nếu khác địa chỉ trụ sở chính',
          },
          {
            key: 'DIEN_THOAI_TC',
            label: 'Điện thoại',
            type: 'tel',
            required: false,
            scope: 'both',
            placeholder: '024 xxxx xxxx',
          },
          {
            key: 'EMAIL_TC',
            label: 'Email',
            type: 'email',
            required: false,
            scope: 'both',
            placeholder: 'contact@company.vn',
          },
        ],
      },
    ],
  },

  // ── Bước 2: Người đại diện ────────────────────────────────────────────────
  {
    id: 'nguoi-dai-dien',
    title: 'Người đại diện theo pháp luật / Chủ tài khoản',
    shortTitle: 'Đại diện',
    scope: 'both',
    sections: [
      {
        id: 'nddpl-ca-nhan',
        title: 'A.I.3 — Người đại diện theo pháp luật / Người đứng đầu',
        scope: 'both',
        fields: [
          {
            key: 'NDDPL_HO_TEN',
            label: 'Họ và tên',
            type: 'text',
            required: false,
            scope: 'both',
            placeholder: 'Viết đầy đủ, đúng CCCD',
          },
          {
            key: 'NDDPL_CHUC_VU',
            label: 'Chức vụ',
            type: 'text',
            required: false,
            scope: 'both',
            placeholder: 'Giám đốc, Chủ hộ kinh doanh...',
          },
          {
            key: 'NDDPL_NGAY_SINH',
            label: 'Ngày tháng năm sinh',
            type: 'text',
            required: false,
            scope: 'both',
            placeholder: 'dd/mm/yyyy',
          },
          {
            key: 'NDDPL_QUOC_TICH',
            label: 'Quốc tịch',
            type: 'text',
            required: false,
            scope: 'both',
            placeholder: 'Mặc định: Việt Nam',
          },
          {
            key: 'NDDPL_SDT',
            label: 'Số điện thoại liên lạc',
            type: 'tel',
            required: false,
            scope: 'both',
          },
          {
            key: 'NDDPL_EMAIL',
            label: 'Địa chỉ thư điện tử',
            type: 'email',
            required: false,
            scope: 'both',
          },
          {
            key: 'NDDPL_DC_THUONG_TRU',
            label: 'Địa chỉ thường trú tại Việt Nam',
            type: 'textarea',
            required: false,
            scope: 'both',
          },
        ],
      },
      {
        id: 'nddpl-cccd',
        title: 'Giấy tờ định danh',
        subtitle: 'CCCD / Thẻ căn cước / Hộ chiếu',
        scope: 'both',
        fields: [
          {
            key: 'NDDPL_CCCD_SO',
            label: 'Số định danh (CCCD / Hộ chiếu)',
            type: 'text',
            required: false,
            scope: 'both',
            placeholder: '012xxxxxxxxx',
          },
          {
            key: 'NDDPL_CCCD_NGAY_CAP',
            label: 'Ngày cấp',
            type: 'text',
            required: false,
            scope: 'both',
            placeholder: 'dd/mm/yyyy',
          },
          {
            key: 'NDDPL_CCCD_HET_HAN',
            label: 'Có giá trị đến ngày',
            type: 'text',
            required: false,
            scope: 'both',
            placeholder: 'dd/mm/yyyy',
          },
          {
            key: 'NDDPL_CCCD_NOI_CAP',
            label: 'Nơi cấp',
            type: 'select',
            required: false,
            scope: 'both',
            options: NOI_CAP_CCCD_OPTIONS,
          },
          {
            key: 'NDDPL_THI_THUC_SO',
            label: 'Số thị thực / Giấy tờ thay thị thực (nếu có)',
            type: 'text',
            required: false,
            scope: 'both',
            helperText: 'Chỉ điền nếu là người nước ngoài cư trú tại Việt Nam',
          },
          {
            key: 'NDDPL_THI_THUC_NGAY_CAP',
            label: 'Ngày cấp thị thực',
            type: 'text',
            required: false,
            scope: 'both',
            placeholder: 'dd/mm/yyyy',
          },
          {
            key: 'NDDPL_THI_THUC_HET_HAN',
            label: 'Thị thực có giá trị đến ngày',
            type: 'text',
            required: false,
            scope: 'both',
            placeholder: 'dd/mm/yyyy',
          },
          {
            key: 'NDDPL_THI_THUC_NOI_CAP',
            label: 'Nơi cấp thị thực',
            type: 'text',
            required: false,
            scope: 'both',
          },
        ],
      },
    ],
  },

  // ── Bước 3: Ủy quyền & Kế toán (chỉ KHTC) ────────────────────────────────
  // (ĐƯỢC ĐƯA LÊN TRƯỚC BƯỚC NGÂN HÀNG ĐIỆN TỬ THEO YÊU CẦU MỚI)
  {
    id: 'uy-quyen',
    title: 'Thông tin ủy quyền & Kế toán',
    shortTitle: 'Ủy quyền',
    scope: 'khtc',
    sections: [
      {
        id: 'd2-uq-chu-tk',
        title: 'D.2 — Người đại diện theo ủy quyền',
        scope: 'khtc',
        fields: [
          { key: 'D2_HO_TEN',       label: 'Họ và tên',         type: 'text',  required: false, scope: 'khtc' },
          { key: 'D2_CHUC_VU',      label: 'Chức vụ',           type: 'text',  required: false, scope: 'khtc' },
          { key: 'D2_NGAY_SINH',    label: 'Ngày tháng năm sinh', type: 'text', required: false, scope: 'khtc', placeholder: 'dd/mm/yyyy' },
          { key: 'D2_QUOC_TICH',    label: 'Quốc tịch',         type: 'text',  required: false, scope: 'khtc', placeholder: 'Mặc định: Việt Nam' },
          { key: 'D2_CCCD_SO',      label: 'Số CCCD / Hộ chiếu', type: 'text', required: false, scope: 'khtc' },
          { key: 'D2_CCCD_NGAY_CAP', label: 'Ngày cấp',         type: 'text',  required: false, scope: 'khtc', placeholder: 'dd/mm/yyyy' },
          { key: 'D2_CCCD_HET_HAN', label: 'Có giá trị đến',    type: 'text',  required: false, scope: 'khtc', placeholder: 'dd/mm/yyyy' },
          { key: 'D2_CCCD_NOI_CAP', label: 'Nơi cấp',           type: 'select', required: false, scope: 'khtc', options: NOI_CAP_CCCD_OPTIONS },
          { key: 'D2_SDT',          label: 'Số điện thoại',      type: 'tel',   required: false, scope: 'khtc' },
          { key: 'D2_EMAIL',        label: 'Email',               type: 'email', required: false, scope: 'khtc' },
          { key: 'D2_DC_THUONG_TRU', label: 'Địa chỉ thường trú', type: 'textarea', required: false, scope: 'khtc' },
        ],
      },
      {
        id: 'd3-ke-toan-truong',
        title: 'D.3 — Kế toán trưởng / Người phụ trách kế toán',
        scope: 'khtc',
        fields: [
          { key: 'D3_HO_TEN',       label: 'Họ và tên',         type: 'text',  required: false, scope: 'khtc' },
          { key: 'D3_CHUC_VU',      label: 'Chức vụ',           type: 'text',  required: false, scope: 'khtc', placeholder: 'Kế toán trưởng...' },
          { key: 'D3_NGAY_SINH',    label: 'Ngày tháng năm sinh', type: 'text', required: false, scope: 'khtc', placeholder: 'dd/mm/yyyy' },
          { key: 'D3_QUOC_TICH',    label: 'Quốc tịch',         type: 'text',  required: false, scope: 'khtc', placeholder: 'Mặc định: Việt Nam' },
          { key: 'D3_CCCD_SO',      label: 'Số CCCD / Hộ chiếu', type: 'text', required: false, scope: 'khtc' },
          { key: 'D3_CCCD_NGAY_CAP', label: 'Ngày cấp',         type: 'text',  required: false, scope: 'khtc', placeholder: 'dd/mm/yyyy' },
          { key: 'D3_CCCD_HET_HAN', label: 'Có giá trị đến',    type: 'text',  required: false, scope: 'khtc', placeholder: 'dd/mm/yyyy' },
          { key: 'D3_CCCD_NOI_CAP', label: 'Nơi cấp',           type: 'select', required: false, scope: 'khtc', options: NOI_CAP_CCCD_OPTIONS },
          { key: 'D3_SDT',          label: 'Số điện thoại',      type: 'tel',   required: false, scope: 'khtc' },
          { key: 'D3_EMAIL',        label: 'Email',               type: 'email', required: false, scope: 'khtc' },
          { key: 'D3_DC_THUONG_TRU', label: 'Địa chỉ thường trú', type: 'textarea', required: false, scope: 'khtc' },
        ],
      },
      {
        id: 'd5-nguoi-gioi-thieu',
        title: 'D.5 — Người giới thiệu đi giao dịch',
        scope: 'khtc',
        fields: [
          { key: 'D5_HO_TEN',       label: 'Họ và tên',         type: 'text',  required: false, scope: 'khtc' },
          { key: 'D5_NGAY_SINH',    label: 'Ngày tháng năm sinh', type: 'text', required: false, scope: 'khtc', placeholder: 'dd/mm/yyyy' },
          { key: 'D5_QUOC_TICH',    label: 'Quốc tịch',         type: 'text',  required: false, scope: 'khtc', placeholder: 'Mặc định: Việt Nam' },
          { key: 'D5_CCCD_SO',      label: 'Số CCCD / Hộ chiếu', type: 'text', required: false, scope: 'khtc' },
          { key: 'D5_CCCD_NGAY_CAP', label: 'Ngày cấp',         type: 'text',  required: false, scope: 'khtc', placeholder: 'dd/mm/yyyy' },
          { key: 'D5_CCCD_HET_HAN', label: 'Có giá trị đến',    type: 'text',  required: false, scope: 'khtc', placeholder: 'dd/mm/yyyy' },
          { key: 'D5_CCCD_NOI_CAP', label: 'Nơi cấp',           type: 'select', required: false, scope: 'khtc', options: NOI_CAP_CCCD_OPTIONS },
        ],
      },
    ],
  },

  // ── Bước 4: Người dùng dịch vụ NHĐT (USER1, USER2, USER3) ────────────────
  {
    id: 'nguoi-dung-nhdt',
    title: 'Người dùng Dịch vụ Ngân hàng điện tử',
    shortTitle: 'NHĐT',
    scope: 'both',
    sections: [
      {
        id: 'user1',
        title: 'Người dùng thứ 1',
        scope: 'both',
        fields: [
          { key: 'USER1_HO_TEN',       label: 'Họ và tên',         type: 'text',  required: false,  scope: 'both' },
          { key: 'USER1_CCCD_SO',      label: 'Số CCCD / Hộ chiếu', type: 'text',  required: false,  scope: 'both', placeholder: '012xxxxxxxxx' },
          { key: 'USER1_CCCD_NGAY_CAP', label: 'Ngày cấp',         type: 'text',  required: false,  scope: 'both', placeholder: 'dd/mm/yyyy' },
          { key: 'USER1_CCCD_HET_HAN', label: 'Có giá trị đến',    type: 'text',  required: false,  scope: 'both', placeholder: 'dd/mm/yyyy' },
          { key: 'USER1_CCCD_NOI_CAP', label: 'Nơi cấp',           type: 'select', required: false,  scope: 'both', options: NOI_CAP_CCCD_OPTIONS },
          { key: 'USER1_QUOC_TICH',    label: 'Quốc tịch',         type: 'text',  required: false,  scope: 'both', placeholder: 'Mặc định: Việt Nam' },
          { key: 'USER1_SDT',          label: 'Số điện thoại',      type: 'tel',   required: false,  scope: 'both' },
          { key: 'USER1_EMAIL',        label: 'Email',               type: 'email', required: false,  scope: 'both' },
        ],
      },
      {
        id: 'user2',
        title: 'Người dùng thứ 2',
        scope: 'both',
        fields: [
          { key: 'USER2_HO_TEN',       label: 'Họ và tên',         type: 'text',  required: false, scope: 'both' },
          { key: 'USER2_CCCD_SO',      label: 'Số CCCD / Hộ chiếu', type: 'text',  required: false, scope: 'both' },
          { key: 'USER2_CCCD_NGAY_CAP', label: 'Ngày cấp',         type: 'text',  required: false, scope: 'both', placeholder: 'dd/mm/yyyy' },
          { key: 'USER2_CCCD_HET_HAN', label: 'Có giá trị đến',    type: 'text',  required: false, scope: 'both', placeholder: 'dd/mm/yyyy' },
          { key: 'USER2_CCCD_NOI_CAP', label: 'Nơi cấp',           type: 'select', required: false, scope: 'both', options: NOI_CAP_CCCD_OPTIONS },
          { key: 'USER2_QUOC_TICH',    label: 'Quốc tịch',         type: 'text',  required: false, scope: 'both', placeholder: 'Mặc định: Việt Nam' },
          { key: 'USER2_SDT',          label: 'Số điện thoại',      type: 'tel',   required: false, scope: 'both' },
          { key: 'USER2_EMAIL',        label: 'Email',               type: 'email', required: false, scope: 'both' },
        ],
      },
      {
        id: 'user3',
        title: 'Người dùng thứ 3',
        scope: 'both',
        fields: [
          { key: 'USER3_HO_TEN',       label: 'Họ và tên',         type: 'text',  required: false, scope: 'both' },
          { key: 'USER3_CCCD_SO',      label: 'Số CCCD / Hộ chiếu', type: 'text',  required: false, scope: 'both' },
          { key: 'USER3_CCCD_NGAY_CAP', label: 'Ngày cấp',         type: 'text',  required: false, scope: 'both', placeholder: 'dd/mm/yyyy' },
          { key: 'USER3_CCCD_HET_HAN', label: 'Có giá trị đến',    type: 'text',  required: false, scope: 'both', placeholder: 'dd/mm/yyyy' },
          { key: 'USER3_CCCD_NOI_CAP', label: 'Nơi cấp',           type: 'select', required: false, scope: 'both', options: NOI_CAP_CCCD_OPTIONS },
          { key: 'USER3_QUOC_TICH',    label: 'Quốc tịch',         type: 'text',  required: false, scope: 'both', placeholder: 'Mặc định: Việt Nam' },
          { key: 'USER3_SDT',          label: 'Số điện thoại',      type: 'tel',   required: false, scope: 'both' },
          { key: 'USER3_EMAIL',        label: 'Email',               type: 'email', required: false, scope: 'both' },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// BM02 — Cấp lại mật khẩu dịch vụ Ngân hàng điện tử
// ─────────────────────────────────────────────────────────────────────────────

export const BM02_STEPS: WizardStep[] = [
  {
    id: 'thong-tin-tc',
    title: 'Thông tin tổ chức / Hộ kinh doanh',
    shortTitle: 'Tổ chức',
    scope: 'both',
    sections: [
      {
        id: 'bm02-to-chuc',
        title: 'Thông tin tổ chức',
        scope: 'both',
        fields: [
          { key: 'TEN_TO_CHUC_VI',      label: 'Tên tổ chức',           type: 'text',     required: false,  scope: 'both' },
          { key: 'SO_GIAY_TO_PHAP_LY',  label: 'Số giấy tờ pháp lý',   type: 'text',     required: false,  scope: 'both' },
          { key: 'DIA_CHI_GIAO_DICH',   label: 'Địa chỉ giao dịch',     type: 'textarea', required: false,  scope: 'both' },
          { key: 'NDDPL_HO_TEN',        label: 'Người đại diện pháp luật — Họ và tên', type: 'text', required: false, scope: 'both' },
          { key: 'NDDPL_CHUC_VU',       label: 'Chức vụ',               type: 'text',     required: false,  scope: 'both' },
          { key: 'NDDPL_QUOC_TICH',     label: 'Quốc tịch',             type: 'text',     required: false,  scope: 'both', placeholder: 'Mặc định: Việt Nam' },
          { key: 'NDDPL_CCCD_SO',       label: 'Số CCCD / Hộ chiếu',    type: 'text',     required: false,  scope: 'both' },
          { key: 'NDDPL_CCCD_NGAY_CAP', label: 'Ngày cấp',              type: 'text',     required: false,  scope: 'both', placeholder: 'dd/mm/yyyy' },
          { key: 'NDDPL_CCCD_HET_HAN',  label: 'Có giá trị đến ngày',   type: 'text',     required: false,  scope: 'both', placeholder: 'dd/mm/yyyy' },
          { key: 'NDDPL_CCCD_NOI_CAP',  label: 'Nơi cấp',               type: 'select',   required: false,  scope: 'both', options: NOI_CAP_CCCD_OPTIONS },
        ],
      },
    ],
  },
  {
    id: 'nguoi-dung-nhdt-bm02',
    title: 'Người dùng cần cấp lại mật khẩu',
    shortTitle: 'Người dùng',
    scope: 'both',
    sections: [
      {
        id: 'bm02-user1',
        title: 'Người dùng thứ 1',
        scope: 'both',
        fields: [
          { key: 'USER1_HO_TEN',       label: 'Họ và tên',          type: 'text',  required: false,  scope: 'both' },
          { key: 'USER1_CCCD_SO',      label: 'Số CCCD / Hộ chiếu', type: 'text',  required: false,  scope: 'both' },
          { key: 'USER1_CCCD_NGAY_CAP', label: 'Ngày cấp',          type: 'text',  required: false,  scope: 'both', placeholder: 'dd/mm/yyyy' },
          { key: 'USER1_CCCD_HET_HAN', label: 'Có giá trị đến',     type: 'text',  required: false,  scope: 'both', placeholder: 'dd/mm/yyyy' },
          { key: 'USER1_CCCD_NOI_CAP', label: 'Nơi cấp',            type: 'select', required: false,  scope: 'both', options: NOI_CAP_CCCD_OPTIONS },
          { key: 'USER1_QUOC_TICH',    label: 'Quốc tịch',          type: 'text',  required: false,  scope: 'both', placeholder: 'Mặc định: Việt Nam' },
          { key: 'USER1_SDT',          label: 'Số điện thoại',       type: 'tel',   required: false,  scope: 'both' },
          { key: 'USER1_EMAIL',        label: 'Email',                type: 'email', required: false,  scope: 'both' },
        ],
      },
      {
        id: 'bm02-user2',
        title: 'Người dùng thứ 2 (nếu có)',
        scope: 'both',
        fields: [
          { key: 'USER2_HO_TEN',       label: 'Họ và tên',          type: 'text',  required: false, scope: 'both' },
          { key: 'USER2_CCCD_SO',      label: 'Số CCCD / Hộ chiếu', type: 'text',  required: false, scope: 'both' },
          { key: 'USER2_CCCD_NGAY_CAP', label: 'Ngày cấp',          type: 'text',  required: false, scope: 'both', placeholder: 'dd/mm/yyyy' },
          { key: 'USER2_CCCD_HET_HAN', label: 'Có giá trị đến',     type: 'text',  required: false, scope: 'both', placeholder: 'dd/mm/yyyy' },
          { key: 'USER2_CCCD_NOI_CAP', label: 'Nơi cấp',            type: 'select', required: false, scope: 'both', options: NOI_CAP_CCCD_OPTIONS },
          { key: 'USER2_QUOC_TICH',    label: 'Quốc tịch',          type: 'text',  required: false, scope: 'both', placeholder: 'Mặc định: Việt Nam' },
          { key: 'USER2_SDT',          label: 'Số điện thoại',       type: 'tel',   required: false, scope: 'both' },
          { key: 'USER2_EMAIL',        label: 'Email',                type: 'email', required: false, scope: 'both' },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Lọc steps/sections phù hợp với loại hình khách hàng */
export function filterSteps(
  steps: WizardStep[],
  doiTuong: 'khach-hang-to-chuc' | 'ho-kinh-doanh'
): WizardStep[] {
  const scope: FieldScope = doiTuong === 'khach-hang-to-chuc' ? 'khtc' : 'hkd';
  return steps
    .filter((s) => s.scope === 'both' || s.scope === scope)
    .map((step) => ({
      ...step,
      sections: step.sections
        .filter((sec) => sec.scope === 'both' || sec.scope === scope)
        .map((sec) => ({
          ...sec,
          fields: sec.fields.filter(
            (f) => f.scope === 'both' || f.scope === scope
          ),
        }))
        .filter((sec) => sec.fields.length > 0),
      }))
      .filter((s) => s.sections.length > 0);
}

/** Trả về tất cả keys của một template để build payload */
export function getAllKeys(steps: WizardStep[]): string[] {
  return steps.flatMap((s) =>
    s.sections.flatMap((sec) => sec.fields.map((f) => f.key))
  );
}
