'use client'

import { useState } from 'react'

interface SetPrazoModalProps {
  apostila: {
    id: string
    titulo: string
    prazoEstimado?: Date
  }
  onClose: () => void
  onSuccess: () => void
}

export function SetPrazoModal({
  apostila,
  onClose,
  onSuccess,
}: SetPrazoModalProps) {
  const [prazo, setPrazo] = useState(
    apostila.prazoEstimado
      ? new Date(apostila.prazoEstimado).toISOString().split('T')[0]
      : ''
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSalvar() {
    if (!prazo) {
      setError('Informe uma data de prazo')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/apostilas/${apostila.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ prazoEstimado: new Date(prazo).toISOString() }),
      })

      if (!response.ok) throw new Error('Erro ao salvar prazo')

      onSuccess()
    } catch (err) {
      setError('Erro ao salvar prazo. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Definir Prazo de Envio
          </h2>
          <p className="text-gray-600 text-sm mb-4">{apostila.titulo}</p>

          <div className="mb-4">
            <label className="label-base">Data do Prazo *</label>
            <input
              type="date"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              className="input-base"
            />
            <p className="text-xs text-gray-500 mt-1">
              O professor receberá notificação do prazo estabelecido
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-rf-green text-white rounded font-medium hover:bg-opacity-90 disabled:bg-gray-400"
            >
              {loading ? 'Salvando...' : 'Salvar Prazo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
