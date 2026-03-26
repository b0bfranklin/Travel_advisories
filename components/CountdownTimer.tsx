'use client'

import { useEffect, useState } from 'react'
import { timeUntil } from '@/lib/utils'

interface CountdownTimerProps {
  targetIso: string
  label: string
  className?: string
}

export function CountdownTimer({ targetIso, label, className }: CountdownTimerProps) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(id)
  }, [])

  // tick is used to force re-render every minute
  void tick

  const { label: countdownLabel, urgent } = timeUntil(targetIso)

  if (countdownLabel === 'Departed') return null

  return (
    <div className={className}>
      <span className="text-xs text-muted-foreground">{label} </span>
      <span
        className={
          urgent
            ? 'font-semibold text-orange-600 dark:text-orange-400'
            : 'font-semibold text-foreground'
        }
      >
        {countdownLabel}
      </span>
    </div>
  )
}
