'use client'

import { useRouter } from 'next/navigation'
import { SearchBar } from './SearchBar'
import type { DisruptionFilters } from '@/types'

export function HomeSearchBar() {
  const router = useRouter()

  function handleSearch(filters: DisruptionFilters) {
    if (filters.query) {
      router.push(`/flights?q=${encodeURIComponent(filters.query)}`)
    } else {
      router.push('/flights')
    }
  }

  return <SearchBar onSearch={handleSearch} />
}
