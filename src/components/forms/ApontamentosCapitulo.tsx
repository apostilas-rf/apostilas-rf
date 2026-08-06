'use client'

import { useCallback, useEffect, useState } from 'react'

interface Apontamento {
  id: string
  conteudo: string
  resolvido: boolean
  criadoEm: string
  usuario: { id: string; nome: string; role: string } | null
}

function quando(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function ApontamentosCapitulo({ capituloId }: { capituloId: string }) {
  const [apontamentos, setApontamentos] = useState<Apontamento[] | null>(null)
  const [erro, setErro] = useState('')
  const [mexendo, setMexendo] = useState<string | null>(null)

  const buscar = useCallback(async () => {
    try {
      const r = await fetch(`/api/conteudo-capitulos/${capituloId}/apontamentos`, {
        credentials: 'include',
      })
      if (!r.ok) throw new Error('Não foi possível carregar os apontamentos.')
      const d = await r.json()
      setApontamentos(d.data || [])
      setErro('')
    } catch (e: any) {
      setErro(e.message)
      setApontamentos([])
    }
  }, [capituloId])

  useEffect(() => {
    buscar()
  }, [buscar])

  async function alternar(a: Apontamento) {
    setMexendo(a.id)
    try {
      const r = await fetch(`/api/conteudo-capitulos/${capituloId}/apontamentos`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apontamentoId: a.id, resolvido: !a.resolvido }),
      })
      if (!r.ok) {
        const d = await r.json().catch(() => null)
        throw new Error(d?.error || 'Erro ao atualizar o apontamento.')
      }
      await buscar()
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setMexendo(null)
    }
  }

  // Capítulo sem apontamento não precisa ocupar espaço na tela de escrita.
  if (!apontamentos || apontamentos.length === 0) return null

  const abertos = apontamentos.filter((a) => !a.resolvido).length

  return (
    <section className="card-inset border-l-4 border-l-amber-500">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold text-gray-900 dark:text-white">
          Apontamentos da revisão
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {abertos > 0 ? `${abertos} em aberto` : 'todos resolvidos'}
        </span>
      </div>

      {erro && (
        <p role="alert" className="mb-3 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {erro}
        </p>
      )}

      <ul className="space-y-2">
        {apontamentos.map((a) => (
          <li
            key={a.id}
            className={`flex flex-wrap items-start justify-between gap-3 rounded-2xl p-3 ${
              a.resolvido ? 'bg-gray-500/5' : 'bg-[var(--surface)]'
            }`}
            style={{ border: '1px solid var(--line)' }}
          >
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm ${
                  a.resolvido
                    ? 'text-gray-400 line-through dark:text-gray-500'
                    : 'text-gray-800 dark:text-gray-200'
                }`}
              >
                {a.conteudo}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {a.usuario?.nome || 'Revisor'} · {quando(a.criadoEm)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => alternar(a)}
              disabled={mexendo !== null}
              className={`btn-soft shrink-0 disabled:opacity-40 ${
                a.resolvido
                  ? 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20 dark:text-gray-300'
                  : 'btn-soft-primary'
              }`}
            >
              {mexendo === a.id ? '…' : a.resolvido ? 'Reabrir' : 'Marcar resolvido'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
