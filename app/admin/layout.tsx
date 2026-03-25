import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { LayoutDashboard, Plane, Shield, Link2, Bell, FileText, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

const NAV_ITEMS = [
  { href: '/admin', label: 'System Health', icon: Activity, exact: true },
  { href: '/admin/disruptions', label: 'Disruptions', icon: Plane },
  { href: '/admin/insurance', label: 'Insurance', icon: Shield },
  { href: '/admin/redirects', label: 'Redirects', icon: Link2 },
  { href: '/admin/alerts', label: 'Alerts', icon: Bell },
  { href: '/admin/content', label: 'Content', icon: FileText },
]

/**
 * Admin layout — validates the user is authenticated AND in the admins table.
 * This is a server component so we can do the DB check server-side.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // Check admins whitelist
  const { data: admin } = await supabase
    .from('admins')
    .select('email')
    .eq('email', user.email ?? '')
    .single()

  if (!admin) {
    // User is authenticated but not an admin — redirect to login
    redirect('/admin/login?error=unauthorised')
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 border-r md:block">
        <div className="flex h-14 items-center border-b px-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <LayoutDashboard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            TripWatch Admin
          </div>
        </div>
        <nav className="p-2" aria-label="Admin navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>
        <Separator />
        <div className="p-3 text-xs text-muted-foreground">Signed in as {user.email}</div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
