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

  // ── Fix process polyfill issue with Radix UI / Turbopack ─────────────────────
  // Radix UI (used by shadcn/ui) checks process.env.NODE_ENV internally.
  // optimizePackageImports tells Turbopack to properly tree-shake these packages,
  // resolving the "module factory not available" error for the process polyfill.
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      'lucide-react',
    ],
  },

  // ── Turbopack (Next.js 16 default for builds) ─────────────────────────────────
  // An explicit (even empty) turbopack config is required when a webpack config
  // is also present, otherwise Next.js 16 throws a build-time error.
  turbopack: {},

  // ── Webpack fallback — used only when running `next dev --webpack` ─────────────
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        process: false,
      }
    }
    return config
  },

  // ── Power off source maps in production (smaller bundle, no leaked code) ──────
  productionBrowserSourceMaps: false,
}

export default nextConfig
