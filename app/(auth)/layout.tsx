export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-page)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
            CertifyFlow AI
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Simulador de certificações Microsoft
          </p>
        </div>
        {children}
      </div>
    </main>
  )
}
