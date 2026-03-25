/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict mode for better React error detection
  reactStrictMode: true,

  // Image optimisation — approved external domains
  images: {
    remotePatterns: [
      // Airline logos from airhex.com (public CDN)
      {
        protocol: 'https',
        hostname: 'content.airhex.com',
        pathname: '/content/logos/**',
      },
      // Airline logos from airline.com logos
      {
        protocol: 'https',
        hostname: 'www.gstatic.com',
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Next.js needs unsafe-inline for its runtime
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://content.airhex.com https://www.gstatic.com",
              "connect-src 'self' https://*.supabase.co https://*.upstash.io https://opensky-network.org https://www.google-analytics.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          // HSTS — enable once HTTPS is confirmed on production
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      // Cache static assets
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Redirect /go/* affiliate links are handled by API route handler
  // i18n placeholder — full setup in Phase 5 with next-intl
  // i18n: { locales: ['en'], defaultLocale: 'en' },
}

module.exports = nextConfig
