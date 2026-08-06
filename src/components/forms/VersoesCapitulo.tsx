'use client'

import { useEffect, useState } from 'react'

interface Versao {
  id: string
  nomeCapitulo: string
  criadoEm: string
  autor: { id: string; nome: string } | null
  caracteres: number
  trecho: string
}

interface VersoesCapituloProps {
  capituloId: string
  /** Chamado depois de restaurar, para a tela recarregar o capítulo. */
  onRestaurado: () => void
}

function quando(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function VersoesCapitulo({ capituloId, onRestaurado }: VersoesCapituloProps) {
  const [aberto, setAberto] = useState(false)
  const [versoes, setVersoes] = useState<Versao[] | null>(null)
  const [erro, setErro] = useState('')
  const [restaurando, setRestaurando] = useState<string | null>(null)

  useEffect(() => {
    if (!aberto) return

    let cancelado = false
    setErro('')

    fetch(`/api/conteudo-capitulos/${capituloId}/versoes`, { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) {
          const d = await r.json().catch(() => null)
          throw new Error(d?.error || 'Não foi possível carregar o histórico.')
        }
        return r.json()
      })
      .then((d) => {
        if (!cancelado) setVersoes(d.data || [])
      })
      .catch((e) => {
        if (!cancelado) {
          setErro(e.message)
          setVersoes([])
        }
      })

    return () => {
      cancelado = true
    }
  }, [aberto, capituloId])

  async function restaurar(versao: Versao) {
    const ok = window.confirm(
      `Restaurar a versão de ${quando(versao.criadoEm)}?\n\n` +
        'O texto atual não se perde: ele vira uma nova versão no histórico.'
    )
    if (!ok) return

    setRestaurando(versao.id)
    setErro('')
    try {
      const r = await fetch(`/api/conteudo-capitulos/${capituloId}/versoes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versaoId: versao.id }),
      })
      if (!r.ok) {
        const d = await r.json().catch(() => null)
        throw new Error(d?.error || 'Erro ao restaurar a versão.')
      }
      setAberto(false)
      setVersoes(null)
      onRestaurado()
    } catch (e: any) {
      setErro(e.message || 'Erro ao restaurar a versão.')
    } finally {
      setRestaurando(null)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="btn-soft bg-gray-500/10 text-gray-700 hover:bg-gray-500/20 dark:bg-white/5 dark:text-gray-200"
      >
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 8v4l3 2M3.05 11a9 9 0 1 1 .5 4M3 4v5h5" />
        </svg>
        Ver versões anteriores
      </button>

      {aberto && (
        <div className="card-inset mt-3">
          {erro && (
            <p role="alert" className="mb-3 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600">
              {erro}
            </p>
          )}

          {versoes === null && (
            <p className="py-3 text-sm text-gray-500 dark:text-gray-400">Carregando histórico…</p>
          )}

          {versoes?.length === 0 && !erro && (
            <p className="py-3 text-sm text-gray-500 dark:text-gray-400">
              Ainda não há versões anteriores. A primeira aparece assim que você salvar uma
              alteração no texto.
            </p>
          )}

          {versoes && versoes.length > 0 && (
            <ul className="space-y-2">
              {versoes.map((v) => (
                <li
                  key={v.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-2xl bg-[var(--surface)] p-3"
                  style={{ border: '1px solid var(--line)' }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {quando(v.criadoEm)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {v.autor?.nome || 'Autor removido'} · {v.caracteres.toLocaleString('pt-BR')}{' '}
                      caracteres
                      {v.nomeCapitulo && ` · "${v.nomeCapitulo}"`}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                      {v.trecho}
                      {v.caracteres > 180 && '…'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => restaurar(v)}
                    disabled={restaurando !== null}
                    className="btn-soft btn-soft-primary shrink-0 disabled:opacity-40"
                  >
                    {restaurando === v.id ? 'Restaurando…' : 'Restaurar'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
