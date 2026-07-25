'use client'

import { useState } from 'react'

interface ProblemFormProps {
  apostilaId: string
  onSubmit?: () => void
}

export function ProblemForm({ apostilaId, onSubmit }: ProblemFormProps) {
  const [descricao, setDescricao] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (descricao.trim().length < 10) {
      setError('Descrição deve ter no mínimo 10 caracteres')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/diagramadores/problemas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          apostilaId,
          descricao,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Erro ao reportar problema')
        return
      }

      setSuccess('✓ Problema reportado com sucesso! Email enviado ao professor.')
      setDescricao('')

      setTimeout(() => {
        onSubmit?.()
      }, 2000)
    } catch (err) {
      setError('Erro na conexão. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
      <h3 className="font-semibold text-yellow-900">⚠️ Reportar Problema</h3>

      <div>
        <label className="label-base text-sm text-yellow-900">Descrição do Problema *</label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descreva o problema encontrado durante a diagramação..."
          maxLength={500}
          rows={4}
          className="input-base resize-none"
          disabled={loading}
          required
        />
        <p className="text-xs text-yellow-700 mt-1">
          {descricao.length}/500 caracteres
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
        disabled={loading || descricao.trim().length < 10}
        className="w-full py-2 px-3 bg-yellow-600 text-white rounded font-medium hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Enviando...' : 'Enviar Problema (vai notificar professor)'}
      </button>
    </form>
  )
}
