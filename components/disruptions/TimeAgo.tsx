'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TimeAgoProps {
  timestamp: string // ISO 8601
  className?: string
  prefix?: string // e.g. "Updated" or "Last seen"
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)

  if (diffSeconds < 5) return 'just now'
  if (diffSeconds < 60) return `${diffSeconds} seconds ago`
  if (diffMinutes === 1) return '1 minute ago'
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`
  if (diffHours === 1) return '1 hour ago'
  if (diffHours < 24) return `${diffHours} hours ago`
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

export function TimeAgo({ timestamp, className, prefix = 'Updated' }: TimeAgoProps) {
  const date = new Date(timestamp)
  const [display, setDisplay] = useState(() => formatTimeAgo(date))

  useEffect(() => {
    setDisplay(formatTimeAgo(date))
    const interval = setInterval(() => {
      setDisplay(formatTimeAgo(date))
    }, 30000) // recalculate every 30 seconds

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timestamp])

  return (
    <time
      dateTime={timestamp}
      title={new Date(timestamp).toLocaleString('en-AU')}
      className={cn('text-xs tabular-nums text-muted-foreground', className)}
    >
      {prefix} {display}
    </time>
  )
}
