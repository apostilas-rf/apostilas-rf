'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface ItemAtencao {
  id: string
  gravidade: 'critico' | 'aviso'
  titulo: string
  detalhe: string
  href: string
}

export function BlocoAtencao() {
  const [itens, setItens] = useState<ItemAtencao[] | null>(null)

  useEffect(() => {
    let cancelado = false
    fetch('/api/dashboard/atencao', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('falha'))))
      .then((d) => {
        if (!cancelado) setItens(d.data || [])
      })
      .catch(() => {
        // Falhar aqui não deve derrubar o painel inteiro.
        if (!cancelado) setItens([])
      })
    return () => {
      cancelado = true
    }
  }, [])

  // Nada pendente (ou papel sem visão de gestão): o bloco some em vez de
  // ocupar espaço dizendo que está tudo bem.
  if (!itens || itens.length === 0) return null

  const criticos = itens.filter((i) => i.gravidade === 'critico').length

  return (
    <section className="card mb-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Atenção</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {criticos > 0 && (
            <span className="font-semibold text-red-600 dark:text-red-400">
              {criticos} crítico{criticos > 1 ? 's' : ''}
            </span>
          )}
          {criticos > 0 && itens.length > criticos && ' · '}
          {itens.length > criticos && `${itens.length - criticos} aviso(s)`}
        </span>
      </div>

      <ul className="space-y-2">
        {itens.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className={`flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-gray-500/5 ${
                item.gravidade === 'critico' ? 'bg-red-500/5' : 'bg-amber-500/5'
              }`}
            >
              <span
                aria-hidden="true"
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  item.gravidade === 'critico' ? 'bg-red-500' : 'bg-amber-500'
                }`}
              />
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-gray-900 dark:text-white">
                  {item.titulo}
                </span>
                <span className="block text-sm text-gray-600 dark:text-gray-400">
                  {item.detalhe}
                </span>
              </span>
              <svg
                aria-hidden="true"
                className="mt-1 h-4 w-4 shrink-0 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
