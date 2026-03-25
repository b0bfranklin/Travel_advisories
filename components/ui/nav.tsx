import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'
import { Plane } from 'lucide-react'

export function Nav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-foreground hover:opacity-80"
          aria-label="TripWatch home"
        >
          <Plane className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <span className="text-lg">TripWatch</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-6 text-sm md:flex">
          <Link
            href="/flights"
            className="font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Flights
          </Link>
          <Link
            href="/trains"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Trains
          </Link>
          <Link
            href="/roads"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Roads
          </Link>
          <Link
            href="/insurance"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Insurance
          </Link>
        </nav>

        <ThemeToggle />
      </div>
    </header>
  )
}
