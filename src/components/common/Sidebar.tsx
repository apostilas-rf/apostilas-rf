'use client'

import { usePathname } from 'next/navigation'
import { useSidebar } from '@/contexts/SidebarContext'
import type { UserRole } from '@/types'

type IconeNome =
  | 'painel'
  | 'apostilas'
  | 'professores'
  | 'capitulos'
  | 'diagramacao'
  | 'imagens'
  | 'revisao'
  | 'templates'
  | 'prazos'
  | 'cadastros'

interface SidebarLink {
  href: string
  label: string
  icone: IconeNome
  roles: UserRole[]
}

// Traços dos ícones. Ficam aqui porque só o menu os usa; todos partilham o
// mesmo viewBox 24 e herdam a cor do item, então acompanham o estado ativo.
const TRACOS: Record<IconeNome, string> = {
  painel: 'M4 5h6v6H4zM14 5h6v4h-6zM14 13h6v6h-6zM4 15h6v4H4z',
  apostilas: 'M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM19 3v18',
  professores: 'M17 20v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9.5 8a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM22 20v-2a4 4 0 00-3-3.87M16 4.13a4 4 0 010 7.75',
  capitulos: 'M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8zM14 3v5h5M9 13h6M9 17h4',
  diagramacao: 'M4 4h16v16H4zM4 10h16M10 10v10',
  imagens: 'M3 5h18v14H3zM3 16l4.5-4.5a2 2 0 013 0L15 16M14 12l1.5-1.5a2 2 0 013 0L21 13M8.5 8.5h.01',
  revisao: 'M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  templates: 'M9 3h10a2 2 0 012 2v10M15 9H5a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2v-8a2 2 0 00-2-2z',
  prazos: 'M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  cadastros: 'M15 20v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12.5 8a4 4 0 11-8 0 4 4 0 018 0zM17 11l2 2 4-4',
}

function Icone({ nome }: { nome: IconeNome }) {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={TRACOS[nome]} />
    </svg>
  )
}

const links: SidebarLink[] = [
  {
    href: '/dashboard',
    label: 'Painel',
    icone: 'painel',
    roles: ['PROFESSOR', 'DIAGRAMADOR', 'ILUSTRADOR', 'REVISOR', 'EDITOR', 'GESTOR', 'DIRECAO', 'PROPRIETARIO'],
  },
  {
    href: '/dashboard/apostilas',
    label: 'Minhas Apostilas',
    icone: 'apostilas',
    roles: ['PROFESSOR', 'DIAGRAMADOR', 'ILUSTRADOR', 'REVISOR', 'EDITOR', 'GESTOR', 'DIRECAO', 'PROPRIETARIO'],
  },
  {
    href: '/dashboard/professores',
    label: 'Professores',
    icone: 'professores',
    roles: ['GESTOR'],
  },
  {
    href: '/dashboard/meus-capitulos',
    label: 'Meus Capítulos',
    icone: 'capitulos',
    roles: ['PROFESSOR'],
  },
  {
    href: '/dashboard/diagramadores',
    label: 'Diagramação',
    icone: 'diagramacao',
    roles: ['DIAGRAMADOR', 'GESTOR'],
  },
  {
    href: '/dashboard/ilustrador',
    label: 'Imagens',
    icone: 'imagens',
    roles: ['ILUSTRADOR', 'GESTOR'],
  },
  {
    href: '/dashboard/revisores',
    label: 'Revisão',
    icone: 'revisao',
    roles: ['REVISOR', 'GESTOR'],
  },
  {
    href: '/dashboard/templates',
    label: 'Templates',
    icone: 'templates',
    roles: ['PROFESSOR', 'DIAGRAMADOR', 'ILUSTRADOR', 'REVISOR', 'EDITOR', 'GESTOR', 'DIRECAO', 'PROPRIETARIO'],
  },
  {
    href: '/dashboard/prazos',
    label: 'Prazos',
    icone: 'prazos',
    roles: ['GESTOR'],
  },
  {
    href: '/dashboard/admin-cadastros',
    label: 'Aprovar Cadastros',
    icone: 'cadastros',
    roles: ['GESTOR'],
  },
]

export function Sidebar({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname()
  const { aberto, fechar } = useSidebar()

  const filteredLinks = links.filter((link) => link.roles.includes(userRole))

  const navegacao = (
    <nav className="space-y-1 p-3">
      {filteredLinks.map((link) => {
        const isActive =
          link.href === '/dashboard'
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(link.href + '/')
        return (
          <a
            key={link.href}
            href={link.href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors duration-200 ${
              isActive
                ? 'bg-rf-green text-white shadow-elevated'
                : 'text-gray-600 hover:bg-gray-500/10 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
            }`}
          >
            <Icone nome={link.icone} />
            {link.label}
          </a>
        )
      })}
    </nav>
  )

  const titulo = (
    <p className="px-6 pt-5 pb-1 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
      Menu
    </p>
  )

  return (
    <>
      {/* Desktop: painel flutuante, não uma coluna colada na borda. É a margem
          em volta que faz o layout parecer moderno. */}
      <aside className="hidden md:block w-64 shrink-0 pl-4 lg:pl-6 py-4 sm:py-6">
        <div className="panel sticky top-20 sm:top-28 max-h-[calc(100vh-8rem)] overflow-y-auto shadow-subtle">
          {titulo}
          {navegacao}
        </div>
      </aside>

      {/* Celular: gaveta sobre o conteúdo, já que 256px fixos não cabem */}
      <div
        onClick={fechar}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${
          aberto ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        style={{ backgroundColor: 'var(--surface)' }}
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-72 max-w-[85vw] overflow-y-auto rounded-r-3xl shadow-floating transition-transform duration-300 ${
          aberto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Menu
          </p>
          <button
            onClick={fechar}
            aria-label="Fechar menu"
            className="-mr-2 rounded-xl p-2 text-gray-500 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:bg-white/5"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {navegacao}
      </aside>
    </>
  )
}
