'use client'

export function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {children}
    </div>
  )
}
