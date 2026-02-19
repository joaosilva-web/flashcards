import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Mail, Calendar } from 'lucide-react'
import { Database } from '@/types/database'
import { AppLayout } from '@/components/layout/app-layout'

type Profile = Database['public']['Tables']['profiles']['Row']

export default async function ProfilePage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = (await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()) as { data: Profile | null }

  const createdAt = new Date(user.created_at || '')
  const memberSince = createdAt.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email?.slice(0, 2).toUpperCase()

  return (
    <AppLayout>
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-4xl font-bold mb-2">Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
          <CardDescription>Suas informações básicas de usuário</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{profile?.full_name || 'Usuário'}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  value={profile?.full_name || ''}
                  disabled
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="memberSince">Membro desde</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="memberSince"
                  type="text"
                  value={memberSince}
                  disabled
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Para alterar suas informações pessoais ou senha, entre em contato com o suporte.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferências de Estudo</CardTitle>
          <CardDescription>Configure como você deseja estudar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Cards por sessão</p>
                <p className="text-sm text-muted-foreground">
                  Quantidade padrão de cards em cada sessão de estudo
                </p>
              </div>
              <Input type="number" defaultValue={20} disabled className="w-20" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Novos cards por dia</p>
                <p className="text-sm text-muted-foreground">
                  Limite de novos cards para estudar diariamente
                </p>
              </div>
              <Input type="number" defaultValue={10} disabled className="w-20" />
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                As preferências de estudo serão implementadas em uma futura atualização.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </AppLayout>
  )
}
