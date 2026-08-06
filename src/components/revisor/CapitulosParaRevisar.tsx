'use client'

import { useCallback, useEffect, useState } from 'react'
import { ConteudoRenderizado } from '@/components/cards/ConteudoRenderizado'

interface Apontamento {
  id: string
  conteudo: string
  resolvido: boolean
  criadoEm: string
  usuario: { nome: string } | null
}

interface Capitulo {
  id: string
  capitulo: string
  conteudo: string
  topicos?: string[] | null
}

const CATEGORIAS = [
  { valor: 'ORTOGRAFIA', label: 'Ortografia' },
  { valor: 'DIAGRAMACAO', label: 'Diagramação' },
  { valor: 'SUGESTAO_MELHORIA', label: 'Sugestão' },
] as const

/**
 * Leitura do capítulo para o revisor, com apontamentos ao lado. Não existe
 * campo editável aqui de propósito: o texto é do professor, e o revisor
 * aponta em vez de reescrever.
 */
export function CapitulosParaRevisar({ apostilaId }: { apostilaId: string }) {
  const [capitulos, setCapitulos] = useState<Capitulo[] | null>(null)
  const [apontamentos, setApontamentos] = useState<Record<string, Apontamento[]>>({})
  const [aberto, setAberto] = useState<string | null>(null)
  const [rascunho, setRascunho] = useState('')
  const [categoria, setCategoria] = useState<string>('ORTOGRAFIA')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let cancelado = false
    fetch(`/api/conteudo-capitulos?apostilaId=${apostilaId}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('falha'))))
      .then((d) => {
        if (!cancelado) setCapitulos(d.data || [])
      })
      .catch(() => {
        if (!cancelado) {
          setErro('Não foi possível carregar os capítulos.')
          setCapitulos([])
        }
      })
    return () => {
      cancelado = true
    }
  }, [apostilaId])

  const carregarApontamentos = useCallback(async (capituloId: string) => {
    try {
      const r = await fetch(`/api/conteudo-capitulos/${capituloId}/apontamentos`, {
        credentials: 'include',
      })
      if (!r.ok) return
      const d = await r.json()
      setApontamentos((prev) => ({ ...prev, [capituloId]: d.data || [] }))
    } catch {
      // Falha aqui não impede ler o capítulo.
    }
  }, [])

  function abrir(id: string) {
    const proximo = aberto === id ? null : id
    setAberto(proximo)
    setRascunho('')
    setErro('')
    if (proximo && !apontamentos[proximo]) carregarApontamentos(proximo)
  }

  async function enviar(capituloId: string) {
    if (rascunho.trim().length < 10) {
      setErro('Descreva o apontamento com pelo menos 10 caracteres.')
      return
    }
    setEnviando(true)
    setErro('')
    try {
      const r = await fetch('/api/revisores/comentarios', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apostilaId,
          capituloId,
          conteudo: rascunho.trim(),
          tipo: 'REVISAO',
          categoriaApontamento: categoria,
        }),
      })
      if (!r.ok) {
        const d = await r.json().catch(() => null)
        throw new Error(d?.error || 'Erro ao enviar o apontamento.')
      }
      setRascunho('')
      await carregarApontamentos(capituloId)
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  if (capitulos === null) {
    return <p className="py-6 text-sm text-gray-500 dark:text-gray-400">Carregando capítulos…</p>
  }

  if (capitulos.length === 0) {
    return (
      <p className="py-6 text-sm text-gray-500 dark:text-gray-400">
        Esta apostila ainda não tem capítulos escritos.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {capitulos.map((cap) => {
        const lista = apontamentos[cap.id] || []
        const abertos = lista.filter((a) => !a.resolvido).length

        return (
          <div key={cap.id} className="panel overflow-hidden">
            <button
              type="button"
              onClick={() => abrir(cap.id)}
              aria-expanded={aberto === cap.id}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-500/5"
            >
              <span className="font-semibold text-gray-900 dark:text-white">{cap.capitulo}</span>
              <span className="flex shrink-0 items-center gap-2">
                {abertos > 0 && (
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                    {abertos} aberto{abertos > 1 ? 's' : ''}
                  </span>
                )}
                <svg
                  aria-hidden="true"
                  className={`h-4 w-4 text-gray-400 transition-transform ${aberto === cap.id ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>

            {aberto === cap.id && (
              <div className="px-5 pb-5" style={{ borderTop: '1px solid var(--line)' }}>
                {cap.topicos && cap.topicos.length > 0 && (
                  <p className="pt-4 text-sm text-gray-500 dark:text-gray-400">
                    {cap.topicos.join(' · ')}
                  </p>
                )}

                {/* Somente leitura: nenhum caminho aqui grava no capítulo. */}
                <div className="mt-4 max-h-[50vh] overflow-y-auto">
                  <ConteudoRenderizado texto={cap.conteudo} />
                </div>

                <div className="mt-5 space-y-2" style={{ borderTop: '1px solid var(--line)' }}>
                  <h4 className="label-base pt-4">Novo apontamento</h4>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIAS.map((c) => (
                      <button
                        key={c.valor}
                        type="button"
                        onClick={() => setCategoria(c.valor)}
                        aria-pressed={categoria === c.valor}
                        className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                          categoria === c.valor
                            ? 'bg-rf-green text-white'
                            : 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20 dark:bg-white/5 dark:text-gray-300'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={rascunho}
                    onChange={(e) => setRascunho(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder="Ex: no terceiro parágrafo, 'excessão' está escrito errado."
                    className="input-base resize-none"
                  />
                  {erro && (
                    <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                      {erro}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => enviar(cap.id)}
                    disabled={enviando}
                    className="btn-soft btn-soft-primary disabled:opacity-40"
                  >
                    {enviando ? 'Enviando…' : 'Enviar apontamento'}
                  </button>
                </div>

                {lista.length > 0 && (
                  <ul className="mt-5 space-y-2">
                    {lista.map((a) => (
                      <li
                        key={a.id}
                        className={`rounded-2xl p-3 text-sm ${
                          a.resolvido
                            ? 'bg-gray-500/5 text-gray-400 line-through dark:text-gray-500'
                            : 'bg-amber-500/10 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {a.conteudo}
                        <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                          {a.usuario?.nome || 'Revisor'} ·{' '}
                          {new Date(a.criadoEm).toLocaleDateString('pt-BR')}
                          {a.resolvido && ' · resolvido pelo professor'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
