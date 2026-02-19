'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BookOpen, LayoutDashboard, BarChart3, User, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Baralhos',
    href: '/decks',
    icon: BookOpen,
  },
  {
    label: 'Estatísticas',
    href: '/stats',
    icon: BarChart3,
  },
  {
    label: 'Perfil',
    href: '/profile',
    icon: User,
  },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 border-r bg-background min-h-screen flex flex-col">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="text-3xl">🎴</div>
          <span className="font-bold text-xl">Flashcards</span>
        </Link>
      </div>
      
      <nav className="flex-1 px-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Button
                key={item.href}
                variant={isActive ? 'default' : 'ghost'}
                asChild
                className={cn('w-full justify-start gap-3')}
              >
                <Link href={item.href}>
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </Button>
            )
          })}
        </div>
      </nav>

      <div className="p-3 border-t">
        <Button 
          variant="ghost" 
          onClick={handleLogout} 
          className="w-full justify-start gap-3"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </aside>
  )
}
