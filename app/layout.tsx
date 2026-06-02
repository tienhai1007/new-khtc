import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Biểu mẫu Đăng ký / Thay đổi thông tin — BIDV Chi nhánh Hà Đông",
  description:
    "Cổng thông tin đăng ký mở tài khoản, thay đổi thông tin khách hàng tổ chức và hộ kinh doanh tại BIDV Chi nhánh Hà Đông.",
  keywords: [
    "BIDV",
    "đăng ký tài khoản",
    "khách hàng tổ chức",
    "hộ kinh doanh",
    "thay đổi thông tin",
    "BIDV Hà Đông",
  ],
  authors: [{ name: "BIDV Chi nhánh Hà Đông" }],
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1B7070",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
