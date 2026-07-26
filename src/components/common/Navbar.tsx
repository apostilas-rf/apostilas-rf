'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { UserSession } from '@/types'

export function Navbar() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<UserSession | null>(null)
  const [foto, setFoto] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [abrirMenu, setAbrirMenu] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Detectar dark mode ao carregar
    const isDark = localStorage.getItem('dark-mode') === 'true' ||
                   document.documentElement.classList.contains('dark')
    setDarkMode(isDark)

    // Observar mudanças no dark mode
    const observer = new MutationObserver(() => {
      const isDarkNow = document.documentElement.classList.contains('dark')
      setDarkMode(isDarkNow)
    })

    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
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
        console.error('Erro ao buscar dados:', error)
      } finally {
        setCarregando(false)
      }
    }

    buscarDados()
  }, [])

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/auth/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  if (carregando) {
    return <nav className="bg-white border-b border-gray-200"></nav>
  }

  return (
    <nav
      className="sticky top-0 z-40 border-b border-gray-200/60 dark:border-gray-800 shadow-subtle"
      style={{
        // O pattern vale nos dois temas; so o fundo atras dele muda
        backgroundColor: darkMode ? '#111827' : '#ffffff',
        backgroundImage: "url('/ICONS APOSTILA/PATTERN verde escuro.svg?v=10')",
        backgroundRepeat: 'repeat-x',
        backgroundSize: '105px 100%',
        backgroundAttachment: 'scroll',
        backgroundPosition: '0 center',
      }}
    >
      <div className="px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center h-20">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-12 h-12 relative transition-all duration-300 group-hover:scale-110">
              <Image
                src={darkMode ? "/logo-white.png" : "/logo.png"}
                alt="Logo RF Educação"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-ubuntu font-bold text-lg text-gray-900 dark:text-white hidden sm:inline tracking-tight">RF Apostilas</span>
          </Link>

          <div className="flex items-center gap-6">
            {!carregando && (
              <div className="relative">
                <button
                  onClick={() => setAbrirMenu(!abrirMenu)}
                  className="flex items-center gap-3 px-4 py-2 rounded-2xl hover:bg-gray-100/60 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  {foto ? (
                    <div className="w-10 h-10 relative rounded-full overflow-hidden shadow-elevated">
                      <Image
                        src={foto}
                        alt="Foto do perfil"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-rf-green to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-elevated">
                      {usuario?.nome?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {usuario?.nome || 'Usuário'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-tight">
                      {usuario?.role || 'usuário'}
                    </p>
                  </div>
                </button>

                {abrirMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-floating z-50 border border-gray-200/60 dark:border-gray-700 animate-slide-in">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {usuario?.nome || 'Usuário'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {usuario?.email || 'sem email'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-tight">
                        {usuario?.role || 'usuário'}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-5 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-300 flex items-center gap-2"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
