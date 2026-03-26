import { Briefcase, Star, ExternalLink } from 'lucide-react'
import { PE_ENTITLEMENTS, EMIRATES_LINKS } from '@/data/trip'

export function EmiratiesInfo() {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Star className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Premium Economy — Quick Reference
        </h2>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {PE_ENTITLEMENTS.map((item) => (
            <div key={item.label} className="flex items-start gap-2 px-4 py-3">
              <Briefcase className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D71920]" />
              <div>
                <div className="text-xs font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Online check-in', href: EMIRATES_LINKS.checkIn },
              { label: 'Manage booking', href: EMIRATES_LINKS.manageBooking },
              { label: 'Lounge access', href: EMIRATES_LINKS.loungeAccess },
              { label: 'Baggage info', href: EMIRATES_LINKS.baggageInfo },
              { label: 'Premium Economy', href: EMIRATES_LINKS.premiumEconomyInfo },
              { label: 'Travel updates', href: EMIRATES_LINKS.operationalUpdates },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs hover:bg-muted"
              >
                {link.label}
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
