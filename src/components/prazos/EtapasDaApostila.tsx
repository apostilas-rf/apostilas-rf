'use client'

import { useCallback, useEffect, useState } from 'react'
import { ETAPAS, ETAPA_LABEL, STATUS_LABEL, diasAte, type Etapa } from '@/lib/etapas'

interface Usuario {
  id: string
  nome: string
}

interface PrazoEtapa {
  id: string
  etapa: Etapa
  dataPrazo: string
  concluido: boolean
  statusPrazo: 'NO_PRAZO' | 'VENCIMENTO_PROXIMO' | 'VENCIDO' | 'COMPLETADO'
  responsavel: Usuario | null
}

const CORES: Record<PrazoEtapa['statusPrazo'], string> = {
  VENCIDO: 'text-red-600 dark:text-red-400',
  VENCIMENTO_PROXIMO: 'text-amber-600 dark:text-amber-400',
  COMPLETADO: 'text-rf-green',
  NO_PRAZO: 'text-gray-900 dark:text-white',
}

function formatar(data: string) {
  return new Date(data).toLocaleDateString('pt-BR')
}

function restante(prazo: PrazoEtapa) {
  if (prazo.concluido) return 'Concluída'
  const dias = diasAte(prazo.dataPrazo)
  if (dias < 0) return `${Math.abs(dias)}d de atraso`
  if (dias === 0) return 'Vence hoje'
  return `faltam ${dias}d`
}

export function EtapasDaApostila({
  apostilaId,
  podeEditar,
}: {
  apostilaId: string
  podeEditar: boolean
}) {
  const [prazos, setPrazos] = useState<PrazoEtapa[] | null>(null)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [erro, setErro] = useState('')
  const [editando, setEditando] = useState<Etapa | null>(null)
  const [rascunho, setRascunho] = useState({ dataPrazo: '', responsavelId: '' })
  const [salvando, setSalvando] = useState(false)

  const buscar = useCallback(async () => {
    try {
      const r = await fetch(`/api/deadlines?apostilaId=${apostilaId}`, {
        credentials: 'include',
      })
      if (!r.ok) throw new Error('Erro ao carregar os prazos das etapas.')
      const d = await r.json()
      setPrazos(d.data || [])
      setErro('')
    } catch (e: any) {
      setErro(e.message || 'Erro ao carregar os prazos das etapas.')
      setPrazos([])
    }
  }, [apostilaId])

  useEffect(() => {
    buscar()
  }, [buscar])

  useEffect(() => {
    if (!podeEditar) return
    fetch('/api/usuarios', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUsuarios(d?.data || []))
      .catch(() => {
        // Sem a lista o gestor ainda consegue gravar a data, só não o responsável.
      })
  }, [podeEditar])

  function abrir(etapa: Etapa) {
    const atual = prazos?.find((p) => p.etapa === etapa)
    setRascunho({
      // <input type="date"> só aceita yyyy-mm-dd.
      dataPrazo: atual ? new Date(atual.dataPrazo).toISOString().slice(0, 10) : '',
      responsavelId: atual?.responsavel?.id || '',
    })
    setEditando(etapa)
  }

  async function salvar() {
    if (!editando || !rascunho.dataPrazo) return
    setSalvando(true)
    try {
      const r = await fetch('/api/deadlines', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apostilaId,
          etapa: editando,
          dataPrazo: rascunho.dataPrazo,
          responsavelId: rascunho.responsavelId || null,
        }),
      })
      const d = await r.json().catch(() => null)
      if (!r.ok) throw new Error(d?.error || 'Erro ao salvar o prazo.')
      setEditando(null)
      await buscar()
    } catch (e: any) {
      setErro(e.message || 'Erro ao salvar o prazo.')
    } finally {
      setSalvando(false)
    }
  }

  async function alternarConcluido(prazo: PrazoEtapa) {
    try {
      const r = await fetch(`/api/deadlines/${prazo.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concluido: !prazo.concluido }),
      })
      if (!r.ok) {
        const d = await r.json().catch(() => null)
        throw new Error(d?.error || 'Erro ao atualizar a etapa.')
      }
      await buscar()
    } catch (e: any) {
      setErro(e.message || 'Erro ao atualizar a etapa.')
    }
  }

  return (
    <div className="card">
      <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Prazos por etapa</h2>

      {erro && (
        <p role="alert" className="mb-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {erro}
        </p>
      )}

      {prazos === null ? (
        <p className="py-6 text-sm text-gray-500 dark:text-gray-400">Carregando…</p>
      ) : (
        /* As quatro sempre aparecem, mesmo sem prazo definido: é o vazio que
           mostra onde falta combinar data. */
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ETAPAS.map(({ valor }) => {
            const prazo = prazos.find((p) => p.etapa === valor)

            return (
              <div key={valor} className="card-inset flex flex-col">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {ETAPA_LABEL[valor]}
                </p>

                {prazo ? (
                  <>
                    <p className={`mt-1 text-lg font-bold ${CORES[prazo.statusPrazo]}`}>
                      {formatar(prazo.dataPrazo)}
                    </p>
                    <p className={`text-xs ${CORES[prazo.statusPrazo]}`}>
                      {STATUS_LABEL[prazo.statusPrazo]} · {restante(prazo)}
                    </p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {prazo.responsavel?.nome || (
                        <span className="text-gray-400">Sem responsável</span>
                      )}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => alternarConcluido(prazo)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-rf-green transition-colors hover:bg-rf-green/10"
                      >
                        {prazo.concluido ? 'Reabrir' : 'Concluir'}
                      </button>
                      {podeEditar && (
                        <button
                          type="button"
                          onClick={() => abrir(valor)}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-500/10 dark:text-gray-400"
                        >
                          Alterar
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-1 text-lg font-bold text-gray-300 dark:text-gray-600">—</p>
                    <p className="text-xs text-gray-400">Sem prazo definido</p>
                    {podeEditar && (
                      <button
                        type="button"
                        onClick={() => abrir(valor)}
                        className="mt-3 self-start rounded-lg px-2 py-1 text-xs font-medium text-rf-green transition-colors hover:bg-rf-green/10"
                      >
                        + Definir prazo
                      </button>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {editando && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setEditando(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="panel w-full max-w-md p-6 shadow-floating"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Prazo · {ETAPA_LABEL[editando]}
            </h3>

            <div className="mt-4 space-y-4">
              <div>
                <label className="label-base" htmlFor="dataPrazo">
                  Data de entrega
                </label>
                <input
                  id="dataPrazo"
                  type="date"
                  value={rascunho.dataPrazo}
                  onChange={(e) => setRascunho((r) => ({ ...r, dataPrazo: e.target.value }))}
                  className="input-base"
                />
              </div>

              <div>
                <label className="label-base" htmlFor="responsavelId">
                  Responsável
                </label>
                <select
                  id="responsavelId"
                  value={rascunho.responsavelId}
                  onChange={(e) => setRascunho((r) => ({ ...r, responsavelId: e.target.value }))}
                  className="input-base"
                >
                  <option value="">A definir</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={salvar}
                disabled={!rascunho.dataPrazo || salvando}
                className="btn-primary flex-1 disabled:opacity-40"
              >
                {salvando ? 'Salvando…' : 'Salvar'}
              </button>
              <button type="button" onClick={() => setEditando(null)} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
