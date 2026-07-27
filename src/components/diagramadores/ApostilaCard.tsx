'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ProgressBar } from '@/components/common/ProgressBar'

interface Arquivo {
  id: string
  nomeOriginal: string
  tipo: string
  googleDriveUrl?: string
  criadoEm: Date
}

interface DiagramacaoProgresso {
  paginaInicio?: number
  paginaFim?: number
  paginasTotal?: number
  percentualProgresso?: number
}

interface ProblemaaDiagramacao {
  id: string
  descricao: string
  status: string
  criadoEm: Date
}

interface ApostilaCardProps {
  id: string
  titulo: string
  materia: string
  serie: string
  status: string
  professor: { nome: string }
  arquivos: Arquivo[]
  progresso?: DiagramacaoProgresso
  problemas: ProblemaaDiagramacao[]
  onRefresh?: () => void
}

export function ApostilaCard({
  id,
  titulo,
  materia,
  serie,
  status,
  professor,
  arquivos,
  progresso,
  problemas = [],
  onRefresh,
}: ApostilaCardProps) {
  const [expanded, setExpanded] = useState(false)
  const arquivosProfessor = (arquivos || []).filter((a) => a.tipo === 'PROFESSOR')
  const problemasAbertos = (problemas || []).filter((p) => p.status === 'ABERTO').length
  const percentualProgresso = progresso?.percentualProgresso || 0

  function getStatusColor() {
    if (problemasAbertos > 0) return 'border-l-red-500'
    if (percentualProgresso === 100) return 'border-l-green-500'
    if (percentualProgresso > 0) return 'border-l-blue-500'
    return 'border-l-amber-500'
  }

  function getStatusBadge() {
    if (problemasAbertos > 0) return { icon: '🚨', text: `${problemasAbertos} problema(s)`, color: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' }
    if (percentualProgresso === 100) return { icon: '✓', text: 'Completo', color: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' }
    if (percentualProgresso > 0) return { icon: '⏳', text: `${percentualProgresso}% pronto`, color: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' }
    return { icon: '📌', text: 'Pendente', color: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300' }
  }

  const statusBadge = getStatusBadge()

  return (
    <div className={`rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border-l-4 ${getStatusColor()} ${
      problemasAbertos > 0
        ? 'bg-red-50 dark:bg-red-950/20'
        : percentualProgresso === 100
        ? 'bg-green-50 dark:bg-green-950/20'
        : percentualProgresso > 0
        ? 'bg-blue-50 dark:bg-blue-950/20'
        : 'bg-white dark:bg-gray-800'
    }`}>
      <div className="p-6 bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {titulo}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {materia} • {serie}
            </p>
          </div>
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${statusBadge.color}`}>
            {statusBadge.icon} {statusBadge.text}
          </span>
        </div>

        {/* Professor Info */}
        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">Professor:</span> {professor.nome}
          </p>
        </div>

        {/* Progresso Info */}
        {progresso && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Progresso de Diagramação</span>
              <span className="text-xl font-bold text-rf-green dark:text-emerald-400">
                {percentualProgresso}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-purple-700 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${percentualProgresso}%` }}
              />
            </div>
            {progresso.paginaInicio !== undefined && progresso.paginaFim !== undefined && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                📄 Páginas: {progresso.paginaInicio} - {progresso.paginaFim} de {progresso.paginasTotal}
              </p>
            )}
          </div>
        )}

        {/* Arquivos do Professor */}
        {arquivosProfessor.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
              📎 {arquivosProfessor.length} arquivo(s) do professor
            </p>
            <div className="space-y-1">
              {arquivosProfessor.slice(0, 2).map((arquivo) => (
                <a
                  key={arquivo.id}
                  href={arquivo.googleDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 truncate"
                >
                  📄 {arquivo.nomeOriginal}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Problemas Abertos */}
        {problemasAbertos > 0 && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-xs font-semibold text-red-700 dark:text-red-300">
              🚨 {problemasAbertos} problema(s) aberto(s)
            </p>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2">
          <Link href={`/dashboard/diagramadores/${id}`} className="flex-1">
            <button className="w-full px-4 py-2 bg-rf-green hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors text-sm">
              → Acompanhar
            </button>
          </Link>
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors text-sm"
          >
            {expanded ? '▼' : '▶'}
          </button>
        </div>

        {/* Expandido */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            {problemas.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Histórico de Problemas ({problemas.length})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {problemas.map((problema) => (
                    <div
                      key={problema.id}
                      className={`p-2 rounded text-xs border ${
                        problema.status === 'ABERTO'
                          ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
                          : problema.status === 'RESPONDIDO'
                          ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800'
                          : 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-gray-900 dark:text-white font-medium flex-1">
                          {problema.descricao.substring(0, 50)}...
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold flex-shrink-0 ${
                          problema.status === 'ABERTO'
                            ? 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300'
                            : problema.status === 'RESPONDIDO'
                            ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300'
                            : 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300'
                        }`}>
                          {problema.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
