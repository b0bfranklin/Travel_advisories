import { Dashboard } from '@/components/Dashboard'
import { getAllFlightStatuses } from '@/lib/aviation'
import { getAllWeather } from '@/lib/weather'
import { getAllAdvisories } from '@/lib/advisories'

// Always server-render fresh — live personal dashboard
export const dynamic = 'force-dynamic'

export default async function Page() {
  // Fetch all data in parallel; gracefully fall back to null on error (e.g. no API keys set)
  const [flightsResult, weatherResult, advisoriesResult] = await Promise.allSettled([
    getAllFlightStatuses(),
    getAllWeather(),
    getAllAdvisories(),
  ])

  return (
    <Dashboard
      initialFlights={flightsResult.status === 'fulfilled' ? flightsResult.value : null}
      initialWeather={weatherResult.status === 'fulfilled' ? weatherResult.value : null}
      initialAdvisories={advisoriesResult.status === 'fulfilled' ? advisoriesResult.value : null}
    />
  )
}
