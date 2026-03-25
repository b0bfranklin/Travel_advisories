'use client'

import { useCallback, useEffect, useState } from 'react'
import { DisruptionCard } from './DisruptionCard'
import { DisruptionCardSkeleton } from './DisruptionCardSkeleton'
import { LastUpdated } from './LastUpdated'
import { AlertTriangle } from 'lucide-react'
import type { Disruption, DisruptionFilters } from '@/types'

const POLL_INTERVAL_MS = 30000 // 30 seconds

interface DisruptionListProps {
  initialData?: Disruption[]
  filters?: DisruptionFilters
  maxItems?: number
}

export function DisruptionList({ initialData, filters, maxItems }: DisruptionListProps) {
  const [disruptions, setDisruptions] = useState<Disruption[]>(initialData ?? [])
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString())

  const fetchDisruptions = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filters?.query) {
        // Detect what kind of query it is
        if (/^[A-Z]{2}\d+$/i.test(filters.query.trim())) {
          params.set('flightNumber', filters.query.trim().toUpperCase())
        } else if (/^[A-Z]{2}$/i.test(filters.query.trim())) {
          params.set('airlineIata', filters.query.trim().toUpperCase())
        } else if (/^[A-Z]{3}$/i.test(filters.query.trim())) {
          params.set('originIata', filters.query.trim().toUpperCase())
        }
      }
      if (filters?.severity) params.set('severity', filters.severity)
      if (filters?.airlineIata) params.set('airlineIata', filters.airlineIata)

      const url = `/api/flights${params.toString() ? `?${params}` : ''}`
      const res = await fetch(url)

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const json = await res.json()
      setDisruptions(json.data ?? [])
      setLastUpdated(json.meta?.lastUpdated ?? new Date().toISOString())
      setError(null)
    } catch (err) {
      setError('Unable to fetch live disruption data. Retrying shortly.')
      console.error('[DisruptionList] fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Initial fetch if no initial data
  useEffect(() => {
    if (!initialData) {
      fetchDisruptions()
    }
  }, [initialData, fetchDisruptions])

  // 30-second polling
  useEffect(() => {
    const interval = setInterval(fetchDisruptions, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchDisruptions])

  const displayed = maxItems ? disruptions.slice(0, maxItems) : disruptions

  if (loading) {
    return (
      <div className="space-y-3" aria-label="Loading disruptions" aria-busy="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <DisruptionCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-300">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-medium">Data unavailable</p>
          <p className="mt-0.5 text-xs">{error}</p>
        </div>
      </div>
    )
  }

  if (displayed.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/30 p-8 text-center text-muted-foreground">
        <p className="text-sm font-medium">No disruptions found</p>
        <p className="mt-1 text-xs">All flights currently appear to be operating normally.</p>
        {lastUpdated && (
          <div className="mt-3 flex justify-center">
            <LastUpdated timestamp={lastUpdated} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div aria-label={`${displayed.length} disruption${displayed.length !== 1 ? 's' : ''}`}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {displayed.length}
          {disruptions.length > displayed.length && ` of ${disruptions.length}`} disruption
          {displayed.length !== 1 ? 's' : ''}
        </p>
        <LastUpdated timestamp={lastUpdated} />
      </div>
      <div className="space-y-3">
        {displayed.map((disruption) => (
          <DisruptionCard key={disruption.id} disruption={disruption} />
        ))}
      </div>
    </div>
  )
}
