'use client'

import { CoffeeIcon, DollarSign, AlertTriangle, Info, ExternalLink, X, CheckCircle2 } from 'lucide-react'

// ─── Accurate lounge data for Qantas Platinum CREDIT CARD holders ─────────────
// The Qantas Platinum credit card gives 2 single-entry lounge passes per year,
// valid only at Qantas Club Domestic or Qantas-operated International Business Lounges.
// It does NOT give Emirates lounge access, Priority Pass, or any overseas lounge access.
//
// Without QFF status (earned by flying), options at DXB and DUS are pay-at-door only.

const LOUNGE_DATA = [
  {
    port: 'MEL',
    portName: 'Melbourne — EK407 departure',
    flight: 'EK407',
    departs: '21:15 AEST',
    access: 'free-with-passes' as const,
    loungeName: 'Emirates Lounge',
    location: 'Terminal 2, Level 3, near Gate 10',
    hours: '18:15–23:30 (daily)',
    note: 'Use one of your 2 annual Qantas Platinum credit card lounge passes here. Valid at this Qantas-operated international lounge. Must link pass to your flight 24h+ before departure via the Qantas app.',
    paidOption: null,
    paidPrice: null,
    fallback: 'Marhaba Lounge (T2, Level 3, between Gates 9–11) — Priority Pass / pay at door',
  },
  {
    port: 'DXB',
    portName: 'Dubai — EK055 transit (outbound)',
    flight: 'EK055',
    departs: '08:30 GST (3h 15m transit)',
    access: 'paid-only' as const,
    loungeName: 'Emirates Business Class Lounge',
    location: 'Terminal 3, Concourse B (matches EK055 gate area)',
    hours: 'Open 24 hours',
    note: 'No free access with Qantas Platinum credit card. Business/First ticket or Skywards/QFF status (earned by flying) required for complimentary entry.',
    paidOption: 'Emirates Lounge — paid entry available to all EK passengers. Must be Skywards member (free to join).',
    paidPrice: 'USD ~$125 Skywards member / ~$155 non-member (per person, subject to capacity)',
    fallback: 'Ahlan or Marhaba Lounges (T3, each Concourse) — Priority Pass / pay at door ~USD$40–60',
  },
  {
    port: 'DXB',
    portName: 'Dubai — EK408 transit (return)',
    flight: 'EK408',
    departs: '02:40 GST (2h 45m transit)',
    access: 'paid-only' as const,
    loungeName: 'Emirates Business Class Lounge',
    location: 'Terminal 3, Concourse B',
    hours: 'Open 24 hours',
    note: '02:40 departure means you land ~midnight and transit overnight. Lounge is open 24h but this is the busiest late-night transit period at DXB.',
    paidOption: 'Emirates Lounge — paid entry as above (subject to capacity at peak time).',
    paidPrice: 'USD ~$125 Skywards member / ~$155 non-member (per person)',
    fallback: 'Ahlan or Marhaba Lounges (T3) — open 24h, Priority Pass / pay at door',
  },
  {
    port: 'DUS',
    portName: 'Düsseldorf — EK056 departure',
    flight: 'EK056',
    departs: '15:25 CEST',
    access: 'paid-only' as const,
    loungeName: 'Emirates Lounge',
    location: 'Pier C (Non-Schengen), near Gate C45',
    hours: 'Approx 12:25–15:25 & 18:15–21:15 (flight-dependent)',
    note: 'No free access with Qantas Platinum credit card. Business/First ticket or Skywards/QFF status required.',
    paidOption: 'Emirates Lounge DUS — paid entry available at the door (subject to capacity). Skywards membership required.',
    paidPrice: 'USD ~$125 Skywards member / ~$155 non-member (per person)',
    fallback: 'DUS Sky Lounge (Pier C, upper floor) — Priority Pass / pay at door €49/person. Good fallback option.',
  },
]

const accessBadge = (access: 'free-with-passes' | 'paid-only') => {
  if (access === 'free-with-passes') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
        <CheckCircle2 className="h-3 w-3" />
        Free — use 1 lounge pass
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900/40 dark:text-orange-300">
      <DollarSign className="h-3 w-3" />
      Paid access only
    </span>
  )
}

export function LoungePanel() {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <CoffeeIcon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Lounge Access — Qantas Platinum Credit Card
        </h2>
      </div>

      {/* What the card actually gives you */}
      <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="text-xs text-blue-800 dark:text-blue-300">
            <strong>What the Qantas Platinum credit card includes:</strong>{' '}
            2 single-entry lounge passes per year — valid at Qantas Club (domestic) or Qantas-operated
            International Business Lounges only. <strong>Does not include Emirates lounges, Priority Pass,
            or any lounge at Dubai or Düsseldorf.</strong> Lounge access at DXB and DUS requires either
            a Business/First class ticket, earned Skywards/QFF frequent flyer status, or paying at the door.
          </div>
        </div>
      </div>

      {/* Pass reminder */}
      <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-xs text-amber-800 dark:text-amber-300">
            <strong>Action before travel:</strong> Link one of your 2 annual Qantas lounge passes to the MEL
            departure (EK407) via the Qantas app or website. Passes must be linked at least 24 hours before
            departure and cannot be unlinked within 24h.{' '}
            <a
              href="https://www.qantas.com/au/en/frequent-flyer/qantas-lounges/lounge-invitations.html"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              Manage lounge passes →
            </a>
          </div>
        </div>
      </div>

      {/* Per-port cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {LOUNGE_DATA.map((l) => (
          <div key={`${l.port}-${l.flight}`} className="rounded-lg border bg-card p-4">
            {/* Header */}
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-semibold">{l.portName}</div>
                <div className="text-xs text-muted-foreground">{l.flight} · departs {l.departs}</div>
              </div>
              {accessBadge(l.access)}
            </div>

            {/* Lounge details */}
            <div className="mb-2 space-y-1 text-xs">
              <div className="font-medium text-foreground">{l.loungeName}</div>
              <div className="text-muted-foreground">{l.location}</div>
              <div className="text-muted-foreground">Hours: {l.hours}</div>
            </div>

            {/* Note */}
            <div className="mb-2 flex items-start gap-1.5 rounded bg-muted/50 px-2 py-1.5 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3 w-3 shrink-0" />
              <span>{l.note}</span>
            </div>

            {/* Paid option */}
            {l.paidOption && (
              <div className="mb-2 flex items-start gap-1.5 text-xs">
                <DollarSign className="mt-0.5 h-3 w-3 shrink-0 text-orange-500" />
                <div>
                  <div className="text-foreground">{l.paidOption}</div>
                  {l.paidPrice && (
                    <div className="mt-0.5 font-medium text-orange-700 dark:text-orange-400">{l.paidPrice}</div>
                  )}
                </div>
              </div>
            )}

            {/* Fallback */}
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <X className="mt-0.5 h-3 w-3 shrink-0" />
              <span><strong className="text-foreground">Fallback: </strong>{l.fallback}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <a
          href="https://www.emirates.com/au/english/experience/our-lounges/paid-lounge-access/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-foreground"
        >
          Emirates paid lounge access <ExternalLink className="h-2.5 w-2.5" />
        </a>
        <span>·</span>
        <a
          href="https://www.emirates.com/au/english/skywards/join/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-foreground"
        >
          Join Skywards free (needed for paid lounge rate) <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
    </section>
  )
}
