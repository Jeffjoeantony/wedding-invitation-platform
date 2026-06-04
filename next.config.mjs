/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Security headers applied to every response ──────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent embedding in iframes (clickjacking)
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Stop MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Referrer policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disable browser features we don't use
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Basic XSS protection for older browsers
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // HSTS — only active over HTTPS (Vercel handles this automatically)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  // ── Production output ────────────────────────────────────────────────────────
  // 'standalone' bundles only the files needed to run → ideal for containers
  // Comment this out if deploying to Vercel (Vercel handles it automatically)
  // output: 'standalone',

  // ── Build-time checks ────────────────────────────────────────────────────────
  // Re-enable TypeScript errors so broken types don't silently ship to prod
  typescript: {
    ignoreBuildErrors: false,
  },

  // ── Images ───────────────────────────────────────────────────────────────────
  images: {
    unoptimized: false, // use Next.js built-in optimiser in production
  },

  // ── Compression / performance ─────────────────────────────────────────────────
  compress: true,

  // ── Power off source maps in production (smaller bundle, no leaked code) ──────
  productionBrowserSourceMaps: false,
}

export default nextConfig
