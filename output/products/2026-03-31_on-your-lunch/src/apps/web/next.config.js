const { config } = require('dotenv');
const { resolve } = require('path');

/* 모노레포 루트(src/.env)에서 환경변수 로딩 */
config({ path: resolve(__dirname, '../../.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_KAKAO_JS_KEY: process.env.NEXT_PUBLIC_KAKAO_JS_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  /* API 프록시: 프론트 → 백엔드 (localhost:3000) */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/v1/:path*',
      },
    ];
  },

  /* 이미지 최적화: Unsplash 등 외부 이미지 허용 */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;
