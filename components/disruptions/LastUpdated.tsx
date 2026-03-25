'use client'

import { RefreshCw } from 'lucide-react'
import { TimeAgo } from './TimeAgo'
import { cn } from '@/lib/utils'

interface LastUpdatedProps {
  timestamp: string // ISO 8601
  isLive?: boolean
  className?: string
}

export function LastUpdated({ timestamp, isLive = true, className }: LastUpdatedProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {isLive && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
      )}
      <RefreshCw className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
      <TimeAgo timestamp={timestamp} prefix="Updated" />
    </div>
  )
}
