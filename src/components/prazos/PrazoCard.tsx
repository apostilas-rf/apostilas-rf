'use client'

import { useState } from 'react'

interface PrazoCardProps {
  id: string
  titulo: string
  descricao?: string
  prazoEntrega: Date | null
  statusPrazo: 'NO_PRAZO' | 'VENCIMENTO_PROXIMO' | 'VENCIDO' | 'COMPLETADO'
  concluido: boolean
  onMarcaConcluido?: (id: string, concluido: boolean) => Promise<void>
}

export function PrazoCard({
  id,
  titulo,
  descricao,
  prazoEntrega,
  statusPrazo,
  concluido,
  onMarcaConcluido,
}: PrazoCardProps) {
  const [marcando, setMarcando] = useState(false)

  const formatarData = (data: Date | null) => {
    if (!data) return 'Sem prazo'
    const date = new Date(data)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getStatusColor = () => {
    switch (statusPrazo) {
      case 'VENCIDO':
        return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
      case 'VENCIMENTO_PROXIMO':
        return 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'
      case 'COMPLETADO':
        return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
      default:
        return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
    }
  }

  const getStatusBadgeColor = () => {
    switch (statusPrazo) {
      case 'VENCIDO':
        return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
      case 'VENCIMENTO_PROXIMO':
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200'
      case 'COMPLETADO':
        return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    }
  }

  const getStatusLabel = () => {
    switch (statusPrazo) {
      case 'VENCIDO':
        return '⚠️ Vencido'
      case 'VENCIMENTO_PROXIMO':
        return '🔔 Vencimento próximo'
      case 'COMPLETADO':
        return '✓ Concluído'
      default:
        return 'No prazo'
    }
  }

  async function handleToggleConcluido() {
    if (!onMarcaConcluido) return
    try {
      setMarcando(true)
      await onMarcaConcluido(id, !concluido)
    } catch (error) {
      console.error('Erro ao marcar como concluído:', error)
    } finally {
      setMarcando(false)
    }
  }

  return (
    <div className={`p-4 rounded-lg border transition-all duration-200 ${getStatusColor()}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">{titulo}</h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadgeColor()}`}>
              {getStatusLabel()}
            </span>
          </div>

          {descricao && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{descricao}</p>
          )}

          <div className="flex items-center gap-4">
            {prazoEntrega && (
              <div className="text-sm">
                <p className="text-gray-500 dark:text-gray-400">Prazo de entrega</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatarData(prazoEntrega)}
                </p>
              </div>
            )}
          </div>
        </div>

        {!concluido && onMarcaConcluido && (
          <button
            onClick={handleToggleConcluido}
            disabled={marcando}
            className="px-4 py-2 rounded-lg bg-rf-green text-white font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {marcando ? 'Marcando...' : 'Marcar concluído'}
          </button>
        )}

        {concluido && (
          <div className="px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-200 font-medium">
            ✓ Concluído
          </div>
        )}
      </div>
    </div>
  )
}
