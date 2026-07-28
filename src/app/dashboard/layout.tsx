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
    <div className="flex-1 dark:bg-gray-900">
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <div className="flex pt-16 sm:pt-24">
            <Sidebar userRole={userRole} />
            <Suspense fallback={<DashboardSkeleton />}>
              {/* min-w-0 impede que tabelas largas estourem a largura da tela */}
              <main className="flex-1 min-w-0 dark:bg-gray-900">
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
