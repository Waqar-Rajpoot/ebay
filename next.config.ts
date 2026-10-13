// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;





import type { NextConfig } from "next";

const DEFAULT_IMAGEKIT_HOST = "ik.imagekit.io";

const imageKitEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
const imageKitHost = imageKitEndpoint
  ? new URL(imageKitEndpoint).hostname
  : DEFAULT_IMAGEKIT_HOST;

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: imageKitHost }],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;