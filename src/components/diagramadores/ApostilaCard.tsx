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

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {materia} • {serie}
            </p>
          </div>
          <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">
            {status}
          </span>
        </div>

        {/* Professor */}
        <div className="text-sm text-gray-600 mb-4">
          <span className="font-medium">Professor:</span> {professor.nome}
        </div>

        {/* Progresso */}
        {progresso && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progresso</span>
              <span className="text-lg font-bold text-rf-green">
                {progresso.percentualProgresso || 0}%
              </span>
            </div>
            <ProgressBar
              progress={progresso.percentualProgresso || 0}
              height="h-2"
            />
            {progresso.paginaInicio !== undefined && progresso.paginaFim !== undefined && (
              <p className="text-xs text-gray-600 mt-2">
                Páginas: {progresso.paginaInicio} - {progresso.paginaFim} (de {progresso.paginasTotal})
              </p>
            )}
          </div>
        )}

        {/* Problemas */}
        {problemasAbertos > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm font-medium text-yellow-800">
              ⚠️ {problemasAbertos} problema(s) aberto(s)
            </p>
          </div>
        )}

        {/* Arquivos */}
        {arquivosProfessor.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">📎 Arquivos do Professor</p>
            <div className="space-y-2">
              {arquivosProfessor.map((arquivo) => (
                <a
                  key={arquivo.id}
                  href={arquivo.googleDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 text-sm bg-gray-50 rounded hover:bg-gray-100 text-rf-green font-medium"
                >
                  📄 {arquivo.nomeOriginal}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Expandir/Retrair */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-rf-green font-medium hover:underline"
        >
          {expanded ? '▼ Retrair' : '▶ Detalhes'}
        </button>

        {/* Expandido */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <Link href={`/dashboard/diagramadores/${id}`}>
              <button className="w-full bg-rf-green text-white py-2 rounded font-medium hover:bg-opacity-90">
                Acompanhar Progresso
              </button>
            </Link>

            {problemas.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Histórico de Problemas</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {problemas.map((problema) => (
                    <div key={problema.id} className="text-xs p-2 bg-gray-50 rounded">
                      <div className="flex justify-between">
                        <span className="font-medium">{problema.descricao.substring(0, 40)}...</span>
                        <span className={`px-2 rounded text-xs ${
                          problema.status === 'ABERTO'
                            ? 'bg-red-100 text-red-700'
                            : problema.status === 'RESPONDIDO'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
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
