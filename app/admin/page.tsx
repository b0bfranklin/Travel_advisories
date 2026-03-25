import { createSupabaseServerClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'
import type { DbSourceHealth } from '@/types'

export const revalidate = 60

function StatusIcon({ status }: { status: number | null }) {
  if (!status) return <Clock className="h-4 w-4 text-muted-foreground" />
  if (status >= 200 && status < 300) return <CheckCircle className="h-4 w-4 text-green-500" />
  if (status >= 400 && status < 500) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
  return <XCircle className="h-4 w-4 text-red-500" />
}

function StatusBadge({ status, failures }: { status: number | null; failures: number }) {
  if (failures > 3) return <Badge variant="destructive">Down</Badge>
  if (!status) return <Badge variant="outline">Unknown</Badge>
  if (status >= 200 && status < 300)
    return (
      <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
        Healthy
      </Badge>
    )
  return <Badge variant="destructive">Error {status}</Badge>
}

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient()

  const [{ data: sourceHealth }, { data: recentDisruptions }, { count: subCount }] =
    await Promise.all([
      supabase.from('source_health').select('*').order('source_name'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from('disruptions')
        .select('id, flight_number, severity, disruption_type, updated_at, source')
        .eq('is_resolved', false)
        .order('updated_at', { ascending: false })
        .limit(5),
      supabase
        .from('alert_subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
    ])

  const healthRows = (sourceHealth ?? []) as DbSourceHealth[]
  const healthyCount = healthRows.filter((r) => r.last_status && r.last_status < 300).length

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold">System Health</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {healthyCount}/{healthRows.length} data sources healthy
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Active disruptions</p>
            <p className="mt-1 text-2xl font-bold">{recentDisruptions?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Alert subscribers</p>
            <p className="mt-1 text-2xl font-bold">{subCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Sources healthy</p>
            <p className="mt-1 text-2xl font-bold">{healthyCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Sources total</p>
            <p className="mt-1 text-2xl font-bold">{healthRows.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Data source health table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Data Source Health</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Last check</TableHead>
                <TableHead className="hidden md:table-cell">Response</TableHead>
                <TableHead className="hidden lg:table-cell">Failures</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {healthRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No source health data yet. Cron jobs will populate this.
                  </TableCell>
                </TableRow>
              )}
              {healthRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">{row.source_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StatusIcon status={row.last_status} />
                      <StatusBadge status={row.last_status} failures={row.consecutive_failures} />
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                    {row.last_check_at
                      ? new Date(row.last_check_at).toLocaleString('en-AU')
                      : 'Never'}
                  </TableCell>
                  <TableCell className="hidden text-xs md:table-cell">
                    {row.response_ms ? `${row.response_ms}ms` : '—'}
                  </TableCell>
                  <TableCell className="hidden text-xs lg:table-cell">
                    {row.consecutive_failures > 0 ? (
                      <span className="text-red-600 dark:text-red-400">
                        {row.consecutive_failures}
                      </span>
                    ) : (
                      '0'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent disruptions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Disruptions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flight</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="hidden md:table-cell">Updated</TableHead>
                <TableHead className="hidden md:table-cell">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!recentDisruptions || recentDisruptions.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No active disruptions.
                  </TableCell>
                </TableRow>
              )}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {recentDisruptions?.map((d: any) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs font-bold">{d.flight_number}</TableCell>
                  <TableCell className="text-xs">{d.disruption_type}</TableCell>
                  <TableCell>
                    <Badge
                      variant={d.severity === 'CRITICAL' ? 'destructive' : 'outline'}
                      className="text-xs"
                    >
                      {d.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                    {new Date(d.updated_at).toLocaleString('en-AU')}
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                    {d.source}
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
