'use client'

import { RefreshCw, AlertTriangle, CheckCircle2, XCircle, ExternalLink, Scale } from 'lucide-react'
import { REBOOKING_INFO } from '@/data/trip'

export function RebookingPanel() {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <RefreshCw className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Rebooking, Refunds & Your Rights
        </h2>
      </div>

      <div className="space-y-3">

        {/* Current waiver status */}
        <div
          className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${
            REBOOKING_INFO.ourFlightsCovered
              ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
              : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40'
          }`}
        >
          {REBOOKING_INFO.ourFlightsCovered ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          )}
          <div className="flex-1 text-sm">
            <div className="font-semibold text-foreground">
              Emirates Disruption Waiver:{' '}
              <span className={REBOOKING_INFO.ourFlightsCovered ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'}>
                {REBOOKING_INFO.ourFlightsCovered ? 'ACTIVE — your flights are covered' : 'Not currently covering your flights'}
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Current waiver window: <strong className="text-foreground">{REBOOKING_INFO.currentWaiverWindow}</strong>
              {' — '}rebook for travel up to <strong className="text-foreground">{REBOOKING_INFO.currentWaiverRebookBy}</strong>.
              Your flights depart <strong className="text-foreground">{REBOOKING_INFO.ourFlightsDates}</strong> — outside this window.
            </div>
            <div className="mt-1.5 text-xs text-muted-foreground">
              Check{' '}
              <a
                href={REBOOKING_INFO.travelUpdatesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-2 hover:text-foreground"
              >
                Emirates Travel Updates
              </a>
              {' '}closer to departure — the waiver may be extended if the regional situation continues.
            </div>
          </div>
        </div>

        {/* Standard fare policy */}
        <div className="rounded-lg border bg-card">
          <div className="border-b px-4 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Standard Policy (applies to your flights now)
            </span>
          </div>
          <div className="divide-y">
            {REBOOKING_INFO.standardPolicy.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 text-xs">
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#D71920]" />
                <div>
                  <div className="font-medium text-foreground">{item.scenario}</div>
                  <div className="mt-0.5 text-muted-foreground">{item.entitlement}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 border-t px-4 py-3">
            <a
              href={REBOOKING_INFO.manageBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs hover:bg-muted"
            >
              Manage booking <ExternalLink className="h-2.5 w-2.5" />
            </a>
            <a
              href={REBOOKING_INFO.refundFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs hover:bg-muted"
            >
              Refund form <ExternalLink className="h-2.5 w-2.5" />
            </a>
            <a
              href={REBOOKING_INFO.disruptionFaqUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs hover:bg-muted"
            >
              Disrupted travel FAQ <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>

        {/* EU261 rights — applies to DUS departure */}
        {REBOOKING_INFO.eu261Applies && (
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
            <Scale className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <div className="text-sm">
              <div className="font-semibold text-blue-800 dark:text-blue-300">
                EU Passenger Rights (EC 261/2004) — applies to EK056
              </div>
              <div className="mt-1 text-xs text-blue-700 dark:text-blue-400">
                {REBOOKING_INFO.eu261Note}
              </div>
              <div className="mt-1.5">
                <a
                  href={REBOOKING_INFO.eu261Link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800 dark:text-blue-300"
                >
                  EU air passenger rights guide
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Regional disruption context */}
        <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 dark:border-orange-800 dark:bg-orange-900/20">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" />
          <div className="text-sm">
            <div className="font-semibold text-orange-800 dark:text-orange-300">
              Middle East Regional Situation
            </div>
            <div className="mt-1 text-xs text-orange-700 dark:text-orange-400">
              Ongoing US/Israel–Iran conflict (since Feb 28, 2026) has caused significant aviation disruption
              through Dubai. Emirates is operating ~90% of planned capacity with some rerouting around Iranian
              airspace (adding 30–90min on some Europe routes). DXB has had four drone-related incidents.
              Your flights are 6–8 weeks away — monitor Emirates Travel Updates and DFAT advisories
              regularly as the situation may change.
            </div>
            <div className="mt-1.5 flex flex-wrap gap-2">
              <a
                href="https://www.emirates.com/english/help/travel-updates/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 underline underline-offset-2 hover:text-orange-800 dark:text-orange-300"
              >
                Emirates travel updates <ExternalLink className="h-2.5 w-2.5" />
              </a>
              <a
                href="https://www.smartraveller.gov.au/destinations/middle-east/united-arab-emirates"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 underline underline-offset-2 hover:text-orange-800 dark:text-orange-300"
              >
                DFAT UAE advisory <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
