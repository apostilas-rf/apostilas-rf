import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { UserProvider } from '@/contexts/UserContext'
import { Navbar } from '@/components/common/Navbar'
import { Sidebar } from '@/components/common/Sidebar'
import { LayoutContent } from './layout-content'
import type { UserRole } from '@/types'

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex pt-24">
          <Sidebar userRole={userRole} />
          <main className="flex-1 dark:bg-gray-900">
            <LayoutContent>
              {children}
            </LayoutContent>
          </main>
        </div>
      </div>
    </UserProvider>
  )
}
