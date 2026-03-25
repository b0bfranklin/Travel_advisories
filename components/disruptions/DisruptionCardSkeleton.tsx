import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export function DisruptionCardSkeleton() {
  return (
    <Card className="overflow-hidden border-l-4 border-l-zinc-200 dark:border-l-zinc-700">
      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>

        {/* Route */}
        <div className="mt-3 flex items-center gap-3">
          <div className="space-y-1">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-4 w-4 rounded" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        {/* Reason */}
        <Skeleton className="mt-2 h-4 w-3/4" />

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between border-t pt-3 dark:border-zinc-800">
          <Skeleton className="h-3 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
