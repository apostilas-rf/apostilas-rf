'use client'

import { useState } from 'react'

interface ProgressFormProps {
  apostilaId: string
  onSubmit?: () => void
  initialData?: {
    paginaInicio?: number
    paginaFim?: number
    paginasTotal?: number
  }
}

export function ProgressForm({
  apostilaId,
  onSubmit,
  initialData,
}: ProgressFormProps) {
  const [paginaInicio, setPaginaInicio] = useState(initialData?.paginaInicio || 1)
  const [paginaFim, setPaginaFim] = useState(initialData?.paginaFim || 1)
  const [paginasTotal, setPaginasTotal] = useState(initialData?.paginasTotal || 100)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const progresso = paginaFim >= paginaInicio
    ? Math.round(((paginaFim - paginaInicio + 1) / paginasTotal) * 100)
    : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (paginaInicio <= 0 || paginaFim <= 0 || paginasTotal <= 0) {
      setError('Todas as páginas devem ser maiores que 0')
      setLoading(false)
      return
    }

    if (paginaInicio > paginaFim) {
      setError('Página inicial não pode ser maior que página final')
      setLoading(false)
      return
    }

    if (paginaFim > paginasTotal) {
      setError('Página final não pode exceder o total de páginas')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/diagramadores/progresso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          apostilaId,
          paginaInicio,
          paginaFim,
          paginasTotal,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Erro ao atualizar progresso')
        return
      }

      setSuccess('✓ Progresso atualizado com sucesso!')
      setTimeout(() => {
        onSubmit?.()
      }, 1500)
    } catch (err) {
      setError('Erro na conexão. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="font-semibold text-gray-900">📊 Rastreamento de Progresso</h3>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label-base text-sm">Página Inicial</label>
          <input
            type="number"
            value={paginaInicio}
            onChange={(e) => setPaginaInicio(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            className="input-base"
            disabled={loading}
          />
        </div>

        <div>
          <label className="label-base text-sm">Página Final</label>
          <input
            type="number"
            value={paginaFim}
            onChange={(e) => setPaginaFim(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            className="input-base"
            disabled={loading}
          />
        </div>

        <div>
          <label className="label-base text-sm">Total de Páginas</label>
          <input
            type="number"
            value={paginasTotal}
            onChange={(e) => setPaginasTotal(Math.max(1, parseInt(e.target.value) || 100))}
            min="1"
            className="input-base"
            disabled={loading}
          />
        </div>
      </div>

      {/* Preview de progresso */}
      <div className="p-3 bg-white rounded border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progresso estimado:</span>
          <span className="text-2xl font-bold text-rf-green">{progresso}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-rf-green h-3 rounded-full transition-all"
            style={{ width: `${progresso}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {paginaFim - paginaInicio + 1} páginas diagramadas de {paginasTotal}
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary"
      >
        {loading ? 'Salvando...' : 'Salvar Progresso'}
      </button>
    </form>
  )
}
