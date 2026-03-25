'use client'

import { useState, useTransition } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DisruptionFilters } from '@/types'

interface SearchBarProps {
  onSearch: (filters: DisruptionFilters) => void
  className?: string
  placeholder?: string
}

function validateSearchQuery(query: string): string | null {
  const trimmed = query.trim()
  if (!trimmed) return null
  // Flight number: 2-letter IATA + up to 4 digits
  if (/^[A-Za-z]{2}\d{1,4}[A-Za-z]?$/.test(trimmed)) return null
  // Airport IATA: exactly 3 letters
  if (/^[A-Za-z]{3}$/.test(trimmed)) return null
  // Airline IATA: exactly 2 letters
  if (/^[A-Za-z]{2}$/.test(trimmed)) return null
  // Airline name: at least 2 chars
  if (trimmed.length >= 2) return null
  return 'Enter a flight number (e.g. QF001), airport code (SYD), or airline name'
}

export function SearchBar({
  onSearch,
  className,
  placeholder = 'Search by flight (QF001), airport (SYD), or airline…',
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const error = validateSearchQuery(query)
    if (error) {
      setValidationError(error)
      return
    }
    setValidationError(null)
    startTransition(() => {
      onSearch({ query: query.trim() })
    })
  }

  function handleClear() {
    setQuery('')
    setValidationError(null)
    startTransition(() => {
      onSearch({})
    })
  }

  return (
    <form onSubmit={handleSubmit} role="search" className={cn('w-full', className)}>
      <div className="relative flex items-center">
        <Search
          className="absolute left-3 h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (validationError) setValidationError(null)
          }}
          placeholder={placeholder}
          className={cn(
            'pl-9 pr-24',
            validationError && 'border-red-500 focus-visible:ring-red-500'
          )}
          aria-label="Search disruptions"
          aria-describedby={validationError ? 'search-error' : undefined}
          aria-invalid={!!validationError}
          autoComplete="off"
          spellCheck={false}
        />
        <div className="absolute right-1 flex gap-1">
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 w-7 p-0"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={isPending || !query.trim()}
            className="h-7 px-3 text-xs"
          >
            {isPending ? 'Searching…' : 'Search'}
          </Button>
        </div>
      </div>
      {validationError && (
        <p id="search-error" role="alert" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
          {validationError}
        </p>
      )}
      <p className="mt-1.5 text-xs text-muted-foreground">
        Examples: <span className="font-mono">QF001</span> · <span className="font-mono">SYD</span>{' '}
        · <span className="font-mono">Emirates</span>
      </p>
    </form>
  )
}
