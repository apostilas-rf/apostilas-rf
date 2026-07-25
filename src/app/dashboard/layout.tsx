import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/common/Navbar'
import { Sidebar } from '@/components/common/Sidebar'
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="flex">
        <Sidebar userRole={userRole} />
        <main className="flex-1 dark:bg-gray-900">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
