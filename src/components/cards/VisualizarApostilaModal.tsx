'use client'

import { useEffect, useState } from 'react'
import { ConteudoRenderizado } from './ConteudoRenderizado'

interface EnemTopico {
  topico: string
  estrelas: number
}

interface Capitulo {
  id: string
  capitulo: string
  topicos?: string[] | null
  enemTopicos?: EnemTopico[] | null
  enemTopico?: string | null
  enemEstrelas?: number | null
  conteudo: string
}

interface VisualizarApostilaModalProps {
  apostilaId: string
  titulo: string
  onClose: () => void
}

// Capítulos antigos guardavam um tópico só em enemTopico/enemEstrelas.
function enemDoCapitulo(cap: Capitulo): EnemTopico[] {
  if (Array.isArray(cap.enemTopicos) && cap.enemTopicos.length > 0) return cap.enemTopicos
  if (cap.enemTopico) return [{ topico: cap.enemTopico, estrelas: cap.enemEstrelas || 3 }]
  return []
}

export function VisualizarApostilaModal({
  apostilaId,
  titulo,
  onClose,
}: VisualizarApostilaModalProps) {
  const [capitulos, setCapitulos] = useState<Capitulo[] | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let cancelado = false

    fetch(`/api/conteudo-capitulos?apostilaId=${apostilaId}`, { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) throw new Error('Não foi possível carregar o conteúdo.')
        return r.json()
      })
      .then((d) => {
        if (!cancelado) setCapitulos(Array.isArray(d?.data) ? d.data : [])
      })
      .catch((e) => {
        if (!cancelado) setErro(e.message || 'Não foi possível carregar o conteúdo.')
      })

    return () => {
      cancelado = true
    }
  }, [apostilaId])

  // Esc fecha, como em qualquer diálogo.
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Visualizar ${titulo}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="panel my-auto w-full max-w-3xl shadow-floating"
      >
        <div
          className="flex items-start justify-between gap-4 px-6 py-4"
          style={{ borderBottom: '1px solid var(--line)' }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Visualização
            </p>
            <h2 className="mt-0.5 text-lg font-bold text-gray-900 dark:text-white">{titulo}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="-mr-2 shrink-0 rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-500/10 dark:text-gray-400 dark:hover:bg-white/5"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {erro && (
            <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600">
              {erro}
            </p>
          )}

          {!erro && capitulos === null && (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Carregando conteúdo…
            </p>
          )}

          {!erro && capitulos?.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Esta apostila ainda não tem capítulos escritos.
            </p>
          )}

          {capitulos?.map((cap, i) => {
            const enem = enemDoCapitulo(cap)
            return (
              <article key={cap.id} className={i > 0 ? 'mt-8' : ''}>
                {i > 0 && <div className="divider" />}

                <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {cap.capitulo}
                </h3>

                {cap.topicos && cap.topicos.length > 0 && (
                  <section className="mt-4">
                    <h4 className="label-base">O que vamos estudar</h4>
                    <ul className="list-inside list-disc space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      {cap.topicos.map((t, j) => (
                        <li key={j}>{t}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {enem.length > 0 && (
                  <section className="mt-4">
                    <h4 className="label-base">Cai no ENEM</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {enem.map((item, j) => (
                        <span
                          key={j}
                          className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-sm text-amber-800 dark:text-amber-200"
                        >
                          {item.topico}
                          <span aria-label={`${item.estrelas} de 5`}>
                            {'⭐'.repeat(item.estrelas)}
                          </span>
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                <section className="mt-5">
                  <ConteudoRenderizado texto={cap.conteudo} />
                </section>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
