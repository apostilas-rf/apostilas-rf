import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { LayoutClient } from './layout-client'
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
    <LayoutClient userRole={userRole}>
      {children}
    </LayoutClient>
  )
}
