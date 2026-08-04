'use client'

export function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    /* Ritmo vertical igual ao da sidebar (py-4 sm:py-6), para que o topo dos
       dois painéis se alinhe. */
    <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      {children}
    </div>
  )
}
