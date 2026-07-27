'use client'

export function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-8">
      {children}
    </div>
  )
}
