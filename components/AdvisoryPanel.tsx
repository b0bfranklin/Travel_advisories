import { ShieldAlert, ExternalLink } from 'lucide-react'
import type { AdvisoryData } from '@/types'
import { ADVISORY_LEVEL_CONFIG } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface AdvisoryPanelProps {
  advisories: AdvisoryData[]
}

function AdvisoryCard({ advisory }: { advisory: AdvisoryData }) {
  const config = ADVISORY_LEVEL_CONFIG[advisory.level]

  return (
    <div className={cn('rounded-lg border p-4', config.bg, config.border)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{advisory.flag}</span>
          <div>
            <div className="font-semibold">{advisory.country}</div>
            <div className={cn('text-xs font-medium', config.color)}>{advisory.levelLabel}</div>
          </div>
        </div>
        <a
          href={advisory.dfatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
          title="View on Smartraveller"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{advisory.summary}</p>
      <div className="mt-2 flex items-center gap-2">
        <a
          href={advisory.dfatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs underline underline-offset-2 hover:no-underline"
        >
          Read full Smartraveller advisory →
        </a>
        {!advisory.isLive && (
          <span className="text-xs text-muted-foreground">
            (Cached{' '}
            {new Intl.DateTimeFormat('en-AU', {
              day: 'numeric',
              month: 'short',
            }).format(new Date(advisory.lastFetched))}
            )
          </span>
        )}
      </div>
    </div>
  )
}

export function AdvisoryPanel({ advisories }: AdvisoryPanelProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          DFAT Travel Advisories
        </h2>
      </div>

      <div className="space-y-3">
        {advisories.map((a) => (
          <AdvisoryCard key={a.slug} advisory={a} />
        ))}
      </div>

      {/* Middle East / Iran situation callout */}
      <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/30">
        <div className="flex items-start gap-2">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" />
          <div>
            <div className="text-sm font-semibold text-orange-800 dark:text-orange-300">
              Middle East Regional Situation
            </div>
            <p className="mt-1 text-xs leading-relaxed text-orange-700 dark:text-orange-400">
              Ongoing tensions in the region (including Iran) may affect airspace routing. Emirates
              continues to monitor the situation and adjusts routing as required. EK407 and EK408
              operate via Dubai (DXB), which remains operational. Check Emirates operational updates
              for the latest information before each flight.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <a
                href="https://www.emirates.com/english/help/travel-updates/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-orange-800 underline underline-offset-2 hover:no-underline dark:text-orange-300"
              >
                Emirates travel updates →
              </a>
              <a
                href="https://www.smartraveller.gov.au/destinations/middle-east/iran"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-orange-800 underline underline-offset-2 hover:no-underline dark:text-orange-300"
              >
                DFAT Iran advisory →
              </a>
              <a
                href="https://www.smartraveller.gov.au/destinations/middle-east/israel-and-the-occupied-territories"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-orange-800 underline underline-offset-2 hover:no-underline dark:text-orange-300"
              >
                DFAT Israel advisory →
              </a>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Advisory data from{' '}
        <a
          href="https://www.smartraveller.gov.au"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
        >
          DFAT Smartraveller
        </a>
        . Always check the official site before travelling.
      </p>
    </section>
  )
}
