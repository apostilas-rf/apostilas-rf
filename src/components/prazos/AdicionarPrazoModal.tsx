'use client'

import { useState, useEffect } from 'react'
import { ETAPAS, type Etapa } from '@/lib/etapas'

interface Apostila {
  id: string
  titulo: string
  materia?: string
}

interface Usuario {
  id: string
  nome: string
  email: string
}

// Papel que costuma atender cada etapa, usado só para pré-filtrar a lista.
// GRAFICA não tem papel próprio na plataforma: quem despacha é o gestor, então
// ali a lista vem inteira.
const ROLE_POR_ETAPA: Partial<Record<Etapa, string>> = {
  REVISAO_INICIAL: 'REVISOR',
  DIAGRAMACAO: 'DIAGRAMADOR',
  REVISAO_FINAL: 'REVISOR',
}

interface AdicionarPrazoModalProps {
  apostilaId: string
  apostilas: Apostila[]
  onAdicionar: (prazo: {
    apostilaId: string
    etapa: Etapa
    dataPrazo: string
    responsavelId: string | null
  }) => Promise<void>
  onFechar: () => void
  onApostilaChange: (id: string) => void
}

export function AdicionarPrazoModal({
  apostilaId,
  apostilas,
  onAdicionar,
  onFechar,
  onApostilaChange,
}: AdicionarPrazoModalProps) {
  const [etapa, setEtapa] = useState<'' | Etapa>('')
  const [responsavelId, setResponsavelId] = useState('')
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [carregandoUsuarios, setCarregandoUsuarios] = useState(false)
  const [data, setData] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  // Ao trocar de etapa, recarrega os responsáveis possíveis.
  useEffect(() => {
    setResponsavelId('')
    setUsuarios([])
    if (!etapa) return

    const role = ROLE_POR_ETAPA[etapa]
    let cancelado = false
    setCarregandoUsuarios(true)

    fetch(role ? `/api/usuarios?role=${role}` : '/api/usuarios', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('falha'))))
      .then((json) => {
        if (!cancelado) setUsuarios(json.data || [])
      })
      .catch(() => {
        if (!cancelado) setErro('Não foi possível carregar os responsáveis')
      })
      .finally(() => {
        if (!cancelado) setCarregandoUsuarios(false)
      })

    return () => {
      cancelado = true
    }
  }, [etapa])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (!apostilaId) return setErro('Selecione uma apostila')
    if (!etapa) return setErro('Selecione a etapa')
    if (!data) return setErro('Selecione a data de entrega')

    try {
      setCarregando(true)
      // Responsável fica opcional: dá para fechar o cronograma antes de saber
      // quem pega cada etapa.
      await onAdicionar({
        apostilaId,
        etapa,
        dataPrazo: data,
        responsavelId: responsavelId || null,
      })
      onFechar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao adicionar prazo')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onFechar}
      role="dialog"
      aria-modal="true"
    >
      <div onClick={(e) => e.stopPropagation()} className="panel w-full max-w-md p-6 shadow-floating">
        <h2 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">Adicionar prazo</h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Uma etapa tem um prazo por apostila — definir de novo substitui o anterior.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-base" htmlFor="apostila">
              Apostila
            </label>
            <select
              id="apostila"
              value={apostilaId}
              onChange={(e) => onApostilaChange(e.target.value)}
              className="input-base"
            >
              <option value="">Selecione uma apostila</option>
              {apostilas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.titulo} {a.materia ? `(${a.materia})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-base" htmlFor="etapa">
              Etapa
            </label>
            <select
              id="etapa"
              value={etapa}
              onChange={(e) => setEtapa(e.target.value as '' | Etapa)}
              className="input-base"
            >
              <option value="">Selecione a etapa</option>
              {ETAPAS.map((e) => (
                <option key={e.valor} value={e.valor}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-base" htmlFor="responsavel">
              Responsável <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <select
              id="responsavel"
              value={responsavelId}
              onChange={(e) => setResponsavelId(e.target.value)}
              disabled={!etapa || carregandoUsuarios}
              className="input-base disabled:opacity-50"
            >
              <option value="">
                {!etapa
                  ? 'Selecione a etapa primeiro'
                  : carregandoUsuarios
                    ? 'Carregando…'
                    : usuarios.length === 0
                      ? 'Nenhum usuário disponível'
                      : 'A definir'}
              </option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-base" htmlFor="dataPrazo">
              Data de entrega
            </label>
            <input
              id="dataPrazo"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="input-base"
            />
          </div>

          {erro && (
            <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {erro}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onFechar} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={carregando}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {carregando ? 'Salvando…' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
