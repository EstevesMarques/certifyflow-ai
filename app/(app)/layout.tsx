import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server-client'
import Sidebar from '@/components/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <Sidebar userEmail={user.email ?? ''} />
      <main className="flex-1 overflow-auto" style={{ background: 'var(--bg-page)' }}>
        {children}
      </main>
    </div>
  )
}
