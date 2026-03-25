import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live Flight Disruptions',
  description:
    'Real-time flight delays, cancellations, and diversions for Australian and international flights. Updated every 30 seconds.',
  openGraph: {
    title: 'Live Flight Disruptions — TripWatch',
    description: 'Real-time flight delays and cancellations. Updated every 30 seconds.',
    url: '/flights',
  },
}

export default function FlightsLayout({ children }: { children: React.ReactNode }) {
  return children
}
