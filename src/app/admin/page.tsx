import { getAdminDashboardData } from '@/actions/admin'
import { Users, Receipt, Target, ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BroadcastButton, ExportCsvButton, DeleteUserButton } from './components'

export default async function AdminDashboardPage() {
  const result = await getAdminDashboardData()
  
  if (!result.success || !result.data) {
    return <div className="text-destructive font-medium">Failed to load admin data.</div>
  }

  const { stats, users } = result.data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground text-sm">Manage users and broadcast platform alerts.</p>
        </div>
        <BroadcastButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Registered Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses Tracked</CardTitle>
            <Receipt className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats.totalExpenses}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Savings Goals</CardTitle>
            <Target className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats.totalGoals}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Recent Users</CardTitle>
          <ExportCsvButton users={users} />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/60 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-medium">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Currency</th>
                  <th className="px-4 py-3">Onboarding</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No users found. RLS may be restricting access, or the table is empty.
                    </td>
                  </tr>
                ) : (
                  users.map((u: { id: string; email: string; full_name: string | null; currency: string; onboarding_complete: boolean; created_at: string }) => (
                    <tr key={u.id} className="bg-card hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{u.full_name || 'Anonymous'}</div>
                        <div className="text-muted-foreground text-xs">{u.email}</div>
                      </td>
                      <td className="px-4 py-3 font-medium uppercase">{u.currency}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${u.onboarding_complete ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                          {u.onboarding_complete ? 'Complete' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
                            View <ArrowUpRight className="h-3 w-3" />
                          </button>
                          <DeleteUserButton userId={u.id} userName={u.full_name || u.email} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
