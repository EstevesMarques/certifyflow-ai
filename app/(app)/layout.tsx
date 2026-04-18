import ResponsiveLayout from '@/components/ResponsiveLayout'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ResponsiveLayout>
      {children}
    </ResponsiveLayout>
  )
}
