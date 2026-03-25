import type { Metadata } from 'next'
import Link from 'next/link'
import { Plane, Train, Car, Ship, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Nav } from '@/components/ui/nav'
import { DisruptionList } from '@/components/disruptions/DisruptionList'
import { HomeSearchBar } from '@/components/disruptions/HomeSearchBar'

// Force dynamic rendering — this page shows live data and must not be statically built
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'TripWatch — Live Travel Disruption & Advisory Hub',
  description:
    'Real-time flight delays, cancellations, and travel advisories for Australian and international travellers. Check live disruptions before you travel.',
  openGraph: {
    title: 'TripWatch — Live Travel Disruption & Advisory Hub',
    description: 'Real-time flight delays, cancellations, and travel advisories.',
    url: '/',
    images: [{ url: '/og-home.png', width: 1200, height: 630, alt: 'TripWatch' }],
  },
}

const TRANSPORT_MODES = [
  {
    name: 'Flights',
    href: '/flights',
    icon: Plane,
    description: 'Live delays & cancellations',
    live: true,
    colour: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    name: 'Trains',
    href: '/trains',
    icon: Train,
    description: 'Rail & transit disruptions',
    live: false,
    colour: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  {
    name: 'Roads',
    href: '/roads',
    icon: Car,
    description: 'Highway & road advisories',
    live: false,
    colour: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    name: 'Maritime',
    href: '/maritime',
    icon: Ship,
    description: 'Ferry & cruise advisories',
    live: false,
    colour: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
  },
]

// Live stats and feed are client-side via DisruptionList polling
// This avoids network calls at build time

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <main>
        {/* Hero */}
        <section
          className="border-b bg-gradient-to-b from-zinc-50 to-background dark:from-zinc-900 dark:to-background"
          aria-labelledby="hero-heading"
        >
          <div className="container py-10 md:py-14">
            <h1
              id="hero-heading"
              className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl"
            >
              Travel disruptions, right now.
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Live flight delays and cancellations for Australian and international travellers. No
              noise — just the disruptions that matter.
            </p>

            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  Live flight disruption data — updated every 30 seconds
                </span>
              </p>
            </div>

            <div className="mt-6 max-w-xl">
              <HomeSearchBar />
            </div>
          </div>
        </section>

        {/* Transport mode cards */}
        <section className="border-b" aria-labelledby="modes-heading">
          <div className="container py-6">
            <h2 id="modes-heading" className="sr-only">
              Transport modes
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {TRANSPORT_MODES.map((mode) => (
                <Link key={mode.name} href={mode.href} className="group">
                  <Card className="h-full transition-shadow group-hover:shadow-md dark:group-hover:shadow-zinc-800">
                    <CardContent className="flex items-start gap-3 p-4">
                      <div className={`rounded-lg p-2 ${mode.bg}`}>
                        <mode.icon className={`h-5 w-5 ${mode.colour}`} aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold">{mode.name}</p>
                          {mode.live ? (
                            <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-950 dark:text-green-400">
                              LIVE
                            </span>
                          ) : (
                            <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                              COMING SOON
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{mode.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Live disruption feed */}
        <section aria-labelledby="disruptions-heading">
          <div className="container py-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="disruptions-heading" className="text-lg font-semibold">
                High priority disruptions
              </h2>
              <Link
                href="/flights"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                See all flights <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
            <DisruptionList filters={{ severity: 'HIGH' }} maxItems={5} />
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        <div className="container">
          <p>
            TripWatch provides disruption information for informational purposes only. Always verify
            with your carrier before travelling.
          </p>
          <p className="mt-2">
            &copy; {new Date().getFullYear()} TripWatch &middot;{' '}
            <Link href="/about" className="hover:underline">
              About
            </Link>{' '}
            &middot;{' '}
            <Link href="/blog" className="hover:underline">
              Blog
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
