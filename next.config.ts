import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cho phép truy cập dev server từ máy khác trong mạng LAN
  allowedDevOrigins: ['10.134.58.195', '192.168.55.106'],
};

export default nextConfig;
