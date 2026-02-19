import { Navbar } from './navbar'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Navbar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  )
}
