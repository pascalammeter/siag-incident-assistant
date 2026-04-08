import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed output: "export" to enable Vercel Functions (API routes require server runtime)
  // See: https://nextjs.org/docs/app/building-your-application/deploying

  // ============================================================================
  // Image Optimization
  // ============================================================================
  images: {
    // Use Vercel's built-in image optimization (free tier: 1000 req/day)
    // Automatically converts to WebP/AVIF on supported browsers
    formats: ["image/avif", "image/webp"],
    // Remote patterns: no external images used currently (all assets are local SVGs)
    remotePatterns: [],
    // Minimum cache TTL for optimized images (1 year = Lighthouse best practice)
    minimumCacheTTL: 31536000,
    // Device sizes for responsive images
    deviceSizes: [375, 640, 768, 1024, 1280, 1920],
  },

  // ============================================================================
  // HTTP Response Headers
  // ============================================================================
  async headers() {
    return [
      // --- Static assets: aggressive caching (1 year, immutable) ---
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // --- Public SVG/image assets: long-lived cache ---
      {
        source: "/(.*)\\.(svg|png|jpg|jpeg|webp|avif|ico|woff2|woff)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // --- API: incident list — 5-minute cache (read-heavy, occasionally stale OK) ---
      {
        source: "/api/incidents",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, s-maxage=300, stale-while-revalidate=60",
          },
        ],
      },
      // --- API: single incident — 10-minute cache ---
      {
        source: "/api/incidents/:id",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=600, s-maxage=600, stale-while-revalidate=60",
          },
        ],
      },
      // --- HTML pages: no client cache, fresh on each request ---
      {
        source: "/((?!_next|api|.*\\..*).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          // Security headers (improve Lighthouse Best Practices score)
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // ============================================================================
  // Compression
  // ============================================================================
  // Vercel automatically enables gzip + brotli — no additional config needed.
  // compress: true is the default in Next.js.
  compress: true,

  // ============================================================================
  // Bundle Optimization
  // ============================================================================
  // SWC minifier is the default in Next.js 13+ — no extra config needed.
  // Turbopack handles dev builds (configured via npm run dev --turbopack).
};

export default nextConfig;
