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

  const getBorderColor = () => {
    switch (statusPrazo) {
      case 'VENCIDO':
        return 'border-l-red-500'
      case 'VENCIMENTO_PROXIMO':
        return 'border-l-amber-500'
      case 'COMPLETADO':
        return 'border-l-green-500'
      default:
        return 'border-l-blue-500'
    }
  }

  const getBackgroundColor = () => {
    switch (statusPrazo) {
      case 'VENCIDO':
        return 'bg-red-50 dark:bg-red-950/20'
      case 'VENCIMENTO_PROXIMO':
        return 'bg-amber-50 dark:bg-amber-950/20'
      case 'COMPLETADO':
        return 'bg-green-50 dark:bg-green-950/20'
      default:
        return 'bg-white dark:bg-gray-800'
    }
  }

  const getStatusBadgeColor = () => {
    switch (statusPrazo) {
      case 'VENCIDO':
        return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
      case 'VENCIMENTO_PROXIMO':
        return 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
      case 'COMPLETADO':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
      default:
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
    }
  }

  const getStatusLabel = () => {
    switch (statusPrazo) {
      case 'VENCIDO':
        return '🚨 Vencido'
      case 'VENCIMENTO_PROXIMO':
        return '⏰ Próximo Vencimento'
      case 'COMPLETADO':
        return '✓ Concluído'
      default:
        return '✓ No Prazo'
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
    <div className={`rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border-l-4 ${getBorderColor()} ${getBackgroundColor()}`}>
      <div className="p-6 bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {titulo}
            </h3>
            {descricao && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {descricao}
              </p>
            )}
          </div>
          <span className={`text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap ml-2 ${getStatusBadgeColor()}`}>
            {getStatusLabel()}
          </span>
        </div>

        {/* Data */}
        {prazoEntrega && (
          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">📅 Prazo de Entrega</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatarData(prazoEntrega)}
            </p>
          </div>
        )}

        {/* Ação */}
        {!concluido && onMarcaConcluido && (
          <button
            onClick={handleToggleConcluido}
            disabled={marcando}
            className="w-full px-4 py-2 bg-rf-green hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 text-sm"
          >
            {marcando ? '⏳ Marcando...' : '✓ Marcar Concluído'}
          </button>
        )}

        {concluido && (
          <div className="w-full px-4 py-2 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-medium rounded-lg text-center text-sm">
            ✓ Concluído
          </div>
        )}
      </div>
    </div>
  )
}
