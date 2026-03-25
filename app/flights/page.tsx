'use client'

import { useState } from 'react'
import { Plane, Filter } from 'lucide-react'
import { Nav } from '@/components/ui/nav'
import { DisruptionList } from '@/components/disruptions/DisruptionList'
import { SearchBar } from '@/components/disruptions/SearchBar'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DisruptionFilters, DisruptionSeverity, DisruptionType } from '@/types'

// Note: metadata must be in a server component — extracted below
// This page is a client component for interactivity

const SEVERITY_OPTIONS: { value: DisruptionSeverity; label: string }[] = [
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
]

const TYPE_OPTIONS: { value: DisruptionType; label: string }[] = [
  { value: 'DELAY', label: 'Delays' },
  { value: 'CANCELLED', label: 'Cancellations' },
  { value: 'DIVERTED', label: 'Diverted' },
  { value: 'ROUTE_CHANGE', label: 'Route Changes' },
  { value: 'GATE_CHANGE', label: 'Gate Changes' },
  { value: 'GROUND_STOP', label: 'Ground Stops' },
]

export default function FlightsPage() {
  const [filters, setFilters] = useState<DisruptionFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <main className="container py-6">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <h1 className="text-xl font-bold">Flight Disruptions</h1>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <span className="text-xs font-medium text-green-600 dark:text-green-400">Live</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Live delays, cancellations, and diversions. Refreshes automatically every 30 seconds.
          </p>
        </div>

        {/* Search + filters */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <SearchBar
                onSearch={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              aria-controls="filter-panel"
              className="shrink-0 gap-1.5"
            >
              <Filter className="h-3.5 w-3.5" aria-hidden="true" />
              Filters
              {(filters.severity || filters.disruptionType) && (
                <span className="ml-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  !
                </span>
              )}
            </Button>
          </div>

          {showFilters && (
            <div
              id="filter-panel"
              className="flex flex-wrap gap-3 rounded-lg border bg-muted/30 p-4"
              role="region"
              aria-label="Disruption filters"
            >
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Severity</label>
                <Select
                  value={filters.severity ?? 'all'}
                  onValueChange={(v) =>
                    setFilters((prev) => ({
                      ...prev,
                      severity: v === 'all' ? undefined : (v as DisruptionSeverity),
                    }))
                  }
                >
                  <SelectTrigger className="h-8 w-36 text-xs">
                    <SelectValue placeholder="All severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All severities</SelectItem>
                    {SEVERITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Type</label>
                <Select
                  value={filters.disruptionType ?? 'all'}
                  onValueChange={(v) =>
                    setFilters((prev) => ({
                      ...prev,
                      disruptionType: v === 'all' ? undefined : (v as DisruptionType),
                    }))
                  }
                >
                  <SelectTrigger className="h-8 w-40 text-xs">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(filters.severity || filters.disruptionType || filters.query) && (
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters({})}
                    className="h-8 text-xs text-muted-foreground"
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live feed */}
        <DisruptionList filters={filters} />
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        <div className="container">
          <p>
            Flight data sourced from OpenSky Network and airline feeds. Information is for
            informational purposes only — always verify with your carrier.
          </p>
        </div>
      </footer>
    </div>
  )
}
