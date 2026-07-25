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

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-5 bg-white">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {professor.nome}
            </h3>
            <p className="text-xs text-gray-600 mt-1">{professor.email}</p>
          </div>
          {professor.temAtrasados && (
            <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded">
              ⚠️ ATRASADO
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Envios: {professor.apostilasEnviadas}/{professor.totalApostilas}
            </span>
            <span className="text-lg font-bold text-rf-green">
              {professor.percentualEnvio}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-rf-green h-3 rounded-full transition-all"
              style={{ width: `${professor.percentualEnvio}%` }}
            />
          </div>
        </div>

        {/* Alertas */}
        {apostilasAtrasadas.length > 0 && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm font-semibold text-red-700 mb-2">
              🔴 {apostilasAtrasadas.length} ATRASADO(S)
            </p>
            {apostilasAtrasadas.map((apostila) => (
              <div key={apostila.id} className="text-xs text-red-600 mb-1">
                • {apostila.titulo} ({getDiasAtraso(apostila.prazoEstimado)} dias)
              </div>
            ))}
          </div>
        )}

        {/* Expandir/Retrair */}
        <button
          onClick={() => setExpandido(!expandido)}
          className="text-sm text-rf-green font-medium hover:underline"
        >
          {expandido ? '▼ Retrair' : '▶ Ver Detalhes'}
        </button>

        {/* Expandido */}
        {expandido && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Apostilas ({professor.totalApostilas})
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
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
                      className={`p-2 rounded text-xs ${
                        enviado
                          ? 'bg-green-50 border border-green-200'
                          : atrasado
                          ? 'bg-red-50 border border-red-200'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-900">
                          {apostila.titulo}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${
                            enviado
                              ? 'bg-green-100 text-green-700'
                              : atrasado
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {enviado
                            ? '✓ Enviado'
                            : atrasado
                            ? `⚠️ ${diasAtraso}d`
                            : '⏳ Pendente'}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        {apostila.materia} • {apostila.serie}
                      </p>
                      <p className="text-gray-500 mt-1">
                        Prazo: {formatarData(apostila.prazoEstimado)}
                      </p>
                      {!enviado && (
                        <button
                          onClick={() => onSetPrazo(apostila)}
                          className="mt-2 text-rf-green font-medium hover:underline"
                        >
                          Definir/Alterar Prazo
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
