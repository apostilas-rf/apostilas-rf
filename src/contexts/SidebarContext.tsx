'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface SidebarContextValue {
  aberto: boolean
  abrir: () => void
  fechar: () => void
  alternar: () => void
}

const SidebarContext = createContext<SidebarContextValue>({
  aberto: false,
  abrir: () => {},
  fechar: () => {},
  alternar: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [aberto, setAberto] = useState(false)
  const pathname = usePathname()

  // Navegar fecha o menu: no celular ele cobre a tela inteira.
  useEffect(() => {
    setAberto(false)
  }, [pathname])

  // Travar o scroll do fundo enquanto o menu está aberto.
  useEffect(() => {
    document.body.style.overflow = aberto ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [aberto])

  return (
    <SidebarContext.Provider
      value={{
        aberto,
        abrir: () => setAberto(true),
        fechar: () => setAberto(false),
        alternar: () => setAberto((v) => !v),
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)
