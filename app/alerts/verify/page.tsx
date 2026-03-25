import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Nav } from '@/components/ui/nav'

export const metadata: Metadata = {
  title: 'Verify Alert Subscription',
  robots: { index: false },
}

interface VerifyPageProps {
  searchParams: Promise<{ success?: string; error?: string; watch?: string }>
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams
  const { success, error, watch } = params

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container flex items-center justify-center py-16">
        <Card className="w-full max-w-sm">
          <CardContent className="p-8 text-center">
            {success ? (
              <>
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" aria-hidden="true" />
                <h1 className="mt-4 text-lg font-bold">Alert activated</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  You&apos;ll receive email notifications when disruptions are detected
                  {watch && (
                    <>
                      {' '}
                      for <strong className="text-foreground">{watch}</strong>
                    </>
                  )}
                  .
                </p>
              </>
            ) : error === 'expired' ? (
              <>
                <Clock className="mx-auto h-12 w-12 text-yellow-500" aria-hidden="true" />
                <h1 className="mt-4 text-lg font-bold">Link expired</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  This verification link has expired. Please subscribe again to get a new link.
                </p>
              </>
            ) : (
              <>
                <XCircle className="mx-auto h-12 w-12 text-red-500" aria-hidden="true" />
                <h1 className="mt-4 text-lg font-bold">Verification failed</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  This verification link is invalid or has already been used.
                </p>
              </>
            )}
            <Button asChild className="mt-6 w-full">
              <Link href="/flights">View live disruptions</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
