import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Nav } from '@/components/ui/nav'

export const metadata: Metadata = {
  title: 'Unsubscribe from Alert',
  robots: { index: false },
}

interface UnsubscribePageProps {
  searchParams: Promise<{ success?: string; error?: string; watch?: string }>
}

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const params = await searchParams
  const { success, watch } = params

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container flex items-center justify-center py-16">
        <Card className="w-full max-w-sm">
          <CardContent className="p-8 text-center">
            {success ? (
              <>
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" aria-hidden="true" />
                <h1 className="mt-4 text-lg font-bold">Unsubscribed</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {watch ? (
                    <>
                      Your alert for <strong className="text-foreground">{watch}</strong> has been
                      cancelled.
                    </>
                  ) : (
                    'Your alert has been cancelled.'
                  )}
                </p>
              </>
            ) : (
              <>
                <XCircle className="mx-auto h-12 w-12 text-red-500" aria-hidden="true" />
                <h1 className="mt-4 text-lg font-bold">Unsubscribe failed</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  We couldn&apos;t find that subscription. It may have already been cancelled.
                </p>
              </>
            )}
            <Button asChild variant="outline" className="mt-6 w-full">
              <Link href="/flights">Back to TripWatch</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
