'use client'

import { useState, memo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { useSidebar } from '@/contexts/SidebarContext'
import { ThemeToggle } from './ThemeToggle'

function NavbarComponent() {
  const router = useRouter()
  const { usuario, foto } = useUser()
  const { alternar } = useSidebar()
  const [abrirMenu, setAbrirMenu] = useState(false)
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    setMontado(true)
  }, [])

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/auth/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    /* Translúcida com blur: o brilho do canvas atravessa por baixo, o que dá a
       leitura de camada de vidro em vez de barra opaca colada no topo. */
    <nav
      style={{ borderColor: 'var(--line)' }}
      className="fixed top-0 left-0 right-0 z-40 border-b bg-[var(--canvas)]/70 backdrop-blur-xl"
    >
      {/* O padrão fica numa camada própria só para poder ter opacidade sem
          desbotar junto o logo, o nome e o menu. Ajuste a intensidade aqui. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10"
        style={{
          backgroundImage: "url('/ICONS APOSTILA/PATTERN verde escuro.svg?v=10')",
          backgroundRepeat: 'repeat-x',
          backgroundSize: '105px 100%',
          backgroundPosition: '0 center',
        }}
      />

      <div className="relative px-4 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center h-16 sm:h-24">
          <button
            onClick={alternar}
            aria-label="Abrir menu"
            className="md:hidden p-2 -ml-2 mr-1 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100/60 dark:hover:bg-gray-800"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link href="/dashboard" className="flex items-center gap-3 mr-auto">
            <div className="w-10 h-10 sm:w-16 sm:h-16 relative">
              <Image
                src="/logo.png"
                alt="Logo RF Educação"
                fill
                className="object-contain dark:hidden"
              />
              <Image
                src="/logo-white.png"
                alt="Logo RF Educação"
                fill
                className="object-contain hidden dark:block"
              />
            </div>
            <span className="font-ubuntu font-bold text-xl text-gray-900 dark:text-white hidden sm:inline tracking-tight">RF Apostilas</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />

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

              {montado && abrirMenu && (
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
                  <Link
                    href="/dashboard/perfil"
                    className="block px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 border-b border-gray-100 dark:border-gray-700"
                    onClick={() => setAbrirMenu(false)}
                  >
                    Meu Perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-300 flex items-center gap-2"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export const Navbar = memo(NavbarComponent)
