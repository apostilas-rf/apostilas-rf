import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { UserProvider } from '@/contexts/UserContext'
import { SidebarProvider } from '@/contexts/SidebarContext'
import { Navbar } from '@/components/common/Navbar'
import { Sidebar } from '@/components/common/Sidebar'
import { LayoutContent } from './layout-content'
import type { UserRole } from '@/types'

function DashboardSkeleton() {
  return (
    <div className="flex-1 p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-9 w-1/4 rounded-2xl bg-gray-500/15"></div>
        <div className="h-4 w-1/3 rounded-xl bg-gray-500/10"></div>
      </div>
    </div>
  )
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const userRole = (headersList.get('x-user-role') || 'PROFESSOR') as UserRole

  if (!headersList.get('x-user-id')) {
    redirect('/auth/login')
  }

  return (
    <UserProvider>
      <SidebarProvider>
        {/* Sem cor de fundo aqui: o canvas e o brilho da marca vêm do body.
            Um bg opaco neste wrapper cobria os dois. */}
        <div className="relative min-h-screen">
          <Navbar />
          <div className="flex pt-16 sm:pt-24">
            <Sidebar userRole={userRole} />
            <Suspense fallback={<DashboardSkeleton />}>
              {/* min-w-0 impede que tabelas largas estourem a largura da tela */}
              <main className="flex-1 min-w-0">
                <LayoutContent>
                  {children}
                </LayoutContent>
              </main>
            </Suspense>
          </div>
        </div>
      </SidebarProvider>
    </UserProvider>
  )
}
