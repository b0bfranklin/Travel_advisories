import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AffiliateLinkProps {
  slug: string // /go/[slug]
  label: string
  className?: string
  children?: React.ReactNode
  showIcon?: boolean
  variant?: 'inline' | 'button'
}

/**
 * AffiliateLink — wraps all affiliate links with:
 * - rel="nofollow sponsored" (required — do not remove)
 * - /go/[slug] redirect (so we can track clicks and update URLs centrally)
 * - External link indicator
 *
 * NEVER use a raw affiliate URL directly in the app.
 * Always use this component with an internal /go/[slug] slug.
 */
export function AffiliateLink({
  slug,
  label,
  className,
  children,
  showIcon = true,
  variant = 'inline',
}: AffiliateLinkProps) {
  const href = `/go/${slug}`

  if (variant === 'button') {
    return (
      <a
        href={href}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        aria-label={`${label} (affiliate link, opens in new tab)`}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className
        )}
      >
        {children ?? label}
        {showIcon && <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />}
      </a>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      aria-label={`${label} (affiliate link, opens in new tab)`}
      className={cn(
        'inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400',
        className
      )}
    >
      {children ?? label}
      {showIcon && <ExternalLink className="h-3 w-3" aria-hidden="true" />}
    </a>
  )
}
