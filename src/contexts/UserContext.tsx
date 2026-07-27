'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { UserSession } from '@/types'

interface UserContextType {
  usuario: UserSession | null
  foto: string | null
  carregando: boolean
  refetch: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UserSession | null>(null)
  const [foto, setFoto] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  async function buscarDados() {
    try {
      const [usuarioRes, fotoRes] = await Promise.all([
        fetch('/api/auth/me', { credentials: 'include' }),
        fetch('/api/usuario/foto', { credentials: 'include' }),
      ])

      if (usuarioRes.ok) {
        const data = await usuarioRes.json()
        if (data.data) {
          setUsuario({
            id: data.data.id,
            nome: data.data.nome || 'Usuário',
            email: data.data.email || '',
            role: data.data.role || 'PROFESSOR',
            ativo: true,
            criadoEm: new Date(),
            atualizadoEm: new Date(),
          })
        }
      }

      if (fotoRes.ok) {
        const fotoData = await fotoRes.json()
        if (fotoData.foto?.dataUrl) {
          setFoto(fotoData.foto.dataUrl)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    buscarDados()
  }, [])

  return (
    <UserContext.Provider value={{ usuario, foto, carregando, refetch: buscarDados }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser deve ser usado dentro de um UserProvider')
  }
  return context
}
