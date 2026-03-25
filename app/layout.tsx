import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ui/theme-provider'

export const metadata: Metadata = {
  title: {
    default: 'TripWatch — Live Travel Disruption & Advisory Hub',
    template: '%s | TripWatch',
  },
  description:
    'Real-time flight disruptions, travel advisories, and alerts for Australian and international travellers.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tripwatch.io'),
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: '/',
    siteName: 'TripWatch',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
