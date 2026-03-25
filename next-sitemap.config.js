/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tripwatch.io',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,

  // Stable pages to include in sitemap
  // Live disruption pages are excluded — they're ephemeral and waste crawl budget

  exclude: [
    // Live flight detail pages — ephemeral
    '/flights/*',
    // Admin routes — private
    '/admin',
    '/admin/*',
    // API routes — not indexable
    '/api/*',
    // Affiliate redirects — not indexable
    '/go/*',
    // Alert flow pages — transient
    '/alerts/verify',
    '/alerts/unsubscribe',
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/go/', '/alerts/verify', '/alerts/unsubscribe'],
      },
    ],
    additionalSitemaps: [
      // Phase 5: per-locale sitemaps will be added here
      // `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap-ja.xml`,
    ],
  },
}
