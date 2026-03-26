import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export const metadata: Metadata = {
  title: 'EK Trip — May 2026',
  description: 'Emirates flight dashboard — MEL/DXB/DUS trip tracker',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
            <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold">🛫 EK Trip Dashboard</span>
              </div>
              <ThemeToggle />
            </div>
          </header>
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
