'use client'

import { useState } from 'react'

interface Apostila {
  id: string
  titulo: string
  materia?: string
}

interface AdicionarPrazoModalProps {
  apostilaId: string
  apostilaTitulo: string
  setores: Array<{ value: string; label: string }>
  apostilas: Apostila[]
  onAdicionar: (prazo: {
    apostilaId: string
    setor?: string
    prazoEntrega: Date
    descricao?: string
  }) => Promise<void>
  onFechar: () => void
  onApostilaChange: (id: string) => void
}

export function AdicionarPrazoModal({
  apostilaId,
  apostilaTitulo,
  setores,
  apostilas,
  onAdicionar,
  onFechar,
  onApostilaChange,
}: AdicionarPrazoModalProps) {
  const [setor, setSetor] = useState('')
  const [data, setData] = useState('')
  const [descricao, setDescricao] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (!apostilaId) {
      setErro('Selecione uma apostila')
      return
    }

    if (!data) {
      setErro('Selecione uma data')
      return
    }

    if (setores.length > 0 && !setor) {
      setErro('Selecione um setor')
      return
    }

    try {
      setCarregando(true)
      await onAdicionar({
        apostilaId,
        setor: setor || undefined,
        prazoEntrega: new Date(data),
        descricao: descricao || undefined,
      })
      onFechar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao adicionar prazo')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-floating p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Adicionar Prazo
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Apostila
            </label>
            <select
              value={apostilaId}
              onChange={(e) => onApostilaChange(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rf-green"
            >
              <option value="">Selecione uma apostila</option>
              {apostilas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.titulo} {a.materia ? `(${a.materia})` : ''}
                </option>
              ))}
            </select>
          </div>

          {setores.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Setor
              </label>
              <select
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rf-green"
              >
                <option value="">Selecione um setor</option>
                {setores.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data de Entrega
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rf-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Revisão final completa"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rf-green resize-none"
              rows={3}
            />
          </div>

          {erro && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {erro}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onFechar}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={carregando}
              className="flex-1 px-4 py-2 rounded-lg bg-rf-green text-white font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {carregando ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
