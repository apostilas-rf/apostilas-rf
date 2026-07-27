'use client'

import { useState } from 'react'

interface Apostila {
  id: string
  titulo: string
  materia: string
  status: string
  serie: string
  criadoEm: Date
  prazoEstimado?: Date
  arquivos: { id: string }[]
}

interface Professor {
  id: string
  nome: string
  email: string
  apostilas: Apostila[]
  totalApostilas: number
  apostilasEnviadas: number
  percentualEnvio: number
  temAtrasados: boolean
}

interface ProfessorCardProps {
  professor: Professor
  onSetPrazo: (apostila: Apostila) => void
  onRefresh: () => void
}

export function ProfessorCard({
  professor,
  onSetPrazo,
  onRefresh,
}: ProfessorCardProps) {
  const [expandido, setExpandido] = useState(false)

  const apostilasAtrasadas = professor.apostilas.filter(
    (a) =>
      a.prazoEstimado &&
      new Date(a.prazoEstimado) < new Date() &&
      a.arquivos.length === 0
  )

  const apostilasPendentes = professor.apostilas.filter(
    (a) => a.arquivos.length === 0
  )

  const proximoPrazo = professor.apostilas
    .filter((a) => a.prazoEstimado && a.arquivos.length === 0)
    .sort((a, b) => new Date(a.prazoEstimado!).getTime() - new Date(b.prazoEstimado!).getTime())[0]

  function formatarData(data?: Date): string {
    if (!data) return '-'
    const d = new Date(data)
    return d.toLocaleDateString('pt-BR')
  }

  function getDiasAtraso(prazo?: Date): number {
    if (!prazo) return 0
    const agora = new Date()
    const prazoDt = new Date(prazo)
    const diff = agora.getTime() - prazoDt.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  function getStatusBadgeColor() {
    if (apostilasAtrasadas.length > 0) return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
    if (apostilasPendentes.length > 0) return 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800'
    return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
  }

  function getStatusIcon() {
    if (apostilasAtrasadas.length > 0) return '🔴'
    if (apostilasPendentes.length > 0) return '⏳'
    return '✓'
  }

  function getStatusText() {
    if (apostilasAtrasadas.length > 0) return `Atrasado (${apostilasAtrasadas.length})`
    if (apostilasPendentes.length > 0) return `Pendente (${apostilasPendentes.length})`
    return 'Completo'
  }

  function getStatusTextColor() {
    if (apostilasAtrasadas.length > 0) return 'text-red-700 dark:text-red-300'
    if (apostilasPendentes.length > 0) return 'text-amber-700 dark:text-amber-300'
    return 'text-green-700 dark:text-green-300'
  }

  return (
    <div className={`rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border-l-4 ${
      apostilasAtrasadas.length > 0
        ? 'border-l-red-500'
        : apostilasPendentes.length > 0
        ? 'border-l-amber-500'
        : 'border-l-green-500'
    } ${getStatusBadgeColor()}`}>
      <div className="p-6 bg-white dark:bg-gray-800">
        {/* Header com Status */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {professor.nome}
              </h3>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                apostilasAtrasadas.length > 0
                  ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                  : apostilasPendentes.length > 0
                  ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                  : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
              }`}>
                {getStatusIcon()} {getStatusText()}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{professor.email}</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-rf-green dark:text-emerald-400">
              {professor.apostilasEnviadas}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Enviadas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {apostilasPendentes.length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Pendentes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {professor.percentualEnvio}%
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Progresso</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Progresso geral
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {professor.apostilasEnviadas}/{professor.totalApostilas}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-rf-green to-emerald-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${professor.percentualEnvio}%` }}
            />
          </div>
        </div>

        {/* Próximo Prazo */}
        {proximoPrazo && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
              📅 Próximo Prazo
            </p>
            <p className="text-sm text-blue-900 dark:text-blue-200 font-medium">
              {proximoPrazo.titulo}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              {formatarData(proximoPrazo.prazoEstimado)}
            </p>
          </div>
        )}

        {/* Alertas de Atraso */}
        {apostilasAtrasadas.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-2">
              🚨 {apostilasAtrasadas.length} atrasado(s)
            </p>
            <div className="space-y-1">
              {apostilasAtrasadas.slice(0, 2).map((apostila) => (
                <p key={apostila.id} className="text-xs text-red-600 dark:text-red-400">
                  • {apostila.titulo} - {getDiasAtraso(apostila.prazoEstimado)} dias
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2">
          <button
            onClick={() => setExpandido(!expandido)}
            className="flex-1 px-4 py-2 bg-rf-green hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors text-sm"
          >
            {expandido ? '▼ Retrair' : '▶ Ver Detalhes'}
          </button>
          {apostilasPendentes.length > 0 && (
            <button
              onClick={() => onSetPrazo(apostilasPendentes[0])}
              className="px-4 py-2 border-2 border-rf-green text-rf-green hover:bg-rf-green hover:text-white font-medium rounded-lg transition-colors text-sm"
            >
              ⏰ Prazo
            </button>
          )}
        </div>

        {/* Expandido */}
        {expandido && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Todas as apostilas ({professor.totalApostilas})
            </p>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {professor.apostilas.map((apostila) => {
                const enviado = apostila.arquivos.length > 0
                const atrasado =
                  apostila.prazoEstimado &&
                  new Date(apostila.prazoEstimado) < new Date() &&
                  !enviado
                const diasAtraso = getDiasAtraso(apostila.prazoEstimado)

                return (
                  <div
                    key={apostila.id}
                    className={`p-3 rounded-lg border ${
                      enviado
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : atrasado
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {apostila.titulo}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          enviado
                            ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300'
                            : atrasado
                            ? 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300'
                            : 'bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {enviado
                          ? '✓ Enviado'
                          : atrasado
                          ? `⚠️ ${diasAtraso}d`
                          : '⏳ Pendente'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {apostila.materia} • {apostila.serie}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                      Prazo: {formatarData(apostila.prazoEstimado)}
                    </p>
                    {!enviado && (
                      <button
                        onClick={() => onSetPrazo(apostila)}
                        className="text-xs text-rf-green dark:text-emerald-400 font-medium hover:underline"
                      >
                        Definir/Alterar Prazo
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
