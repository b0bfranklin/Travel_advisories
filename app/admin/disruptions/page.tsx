import { createSupabaseServerClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { DbDisruption } from '@/types'

export const revalidate = 30

export default async function AdminDisruptionsPage() {
  const supabase = await createSupabaseServerClient()

  const { data: disruptions } = await supabase
    .from('disruptions')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(100)

  const rows = (disruptions ?? []) as DbDisruption[]
  const active = rows.filter((r) => !r.is_resolved)
  const resolved = rows.filter((r) => r.is_resolved)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Disruption Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {active.length} active · {resolved.length} resolved
          </p>
        </div>
        <Button size="sm">+ Add manual disruption</Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Active Disruptions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flight</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="hidden md:table-cell">Reason</TableHead>
                <TableHead className="hidden md:table-cell">Source</TableHead>
                <TableHead className="hidden lg:table-cell">Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {active.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                    No active disruptions.
                  </TableCell>
                </TableRow>
              )}
              {active.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs font-bold">{d.flight_number}</TableCell>
                  <TableCell className="text-xs">
                    {d.origin_iata ?? '?'} → {d.destination_iata ?? '?'}
                  </TableCell>
                  <TableCell className="text-xs">{d.disruption_type}</TableCell>
                  <TableCell>
                    <Badge
                      variant={d.severity === 'CRITICAL' ? 'destructive' : 'outline'}
                      className="text-xs"
                    >
                      {d.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden max-w-[200px] truncate text-xs text-muted-foreground md:table-cell">
                    {d.reason ?? '—'}
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                    {d.source}
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                    {new Date(d.updated_at).toLocaleString('en-AU')}
                  </TableCell>
                  <TableCell>
                    <ResolveButton id={d.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

async function resolveDisruption(id: string) {
  'use server'
  const supabase = await createSupabaseServerClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('disruptions') as any).update({ is_resolved: true }).eq('id', id)
}

function ResolveButton({ id }: { id: string }) {
  return (
    <form action={resolveDisruption.bind(null, id)}>
      <Button type="submit" variant="outline" size="sm" className="h-7 text-xs">
        Resolve
      </Button>
    </form>
  )
}
