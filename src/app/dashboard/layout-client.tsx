'use client'

import { UserProvider } from '@/contexts/UserContext'
import { Navbar } from '@/components/common/Navbar'
import { Sidebar } from '@/components/common/Sidebar'
import type { UserRole } from '@/types'

interface LayoutClientProps {
  userRole: UserRole
  children: React.ReactNode
}

export function LayoutClient({ userRole, children }: LayoutClientProps) {
  return (
    <UserProvider>
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
    </UserProvider>
  )
}
