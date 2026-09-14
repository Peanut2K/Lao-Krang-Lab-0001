import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // Registered via `new URL(...)`, so Next serves the worker from
        // /_next/static/service-worker/. A worker may only claim a scope at or
        // below its own path, which would limit it to that folder and never see
        // a push; this header is what lets it take the root scope it needs.
        source: "/_next/static/service-worker/:file*",
        headers: [{ key: "Service-Worker-Allowed", value: "/" }],
      },
    ];
  },
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/**" }]
      : [],
  },
};

export default nextConfig;
