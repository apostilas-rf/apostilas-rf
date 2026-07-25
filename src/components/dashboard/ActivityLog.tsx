'use client'

import { APOSTILA_STATUS } from '@/lib/constants'
import type { ApostilaStatus } from '@/types'

interface Atividade {
  id: string
  acao: string
  descricao?: string
  statusNovo: ApostilaStatus
  criadoEm: string
  usuario: {
    nome: string
    email: string
  }
  apostila: {
    titulo: string
    serie: string
  }
}

interface ActivityLogProps {
  atividades: Atividade[]
}

export function ActivityLog({ atividades }: ActivityLogProps) {
  if (atividades.length === 0) {
    return (
      <div className="card dark:bg-gray-800/50 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-rf-green mb-4">Atividades Recentes</h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Nenhuma atividade registrada
        </div>
      </div>
    )
  }

  return (
    <div className="card dark:bg-gray-800/50 dark:border-gray-700">
      <h3 className="font-semibold text-gray-900 dark:text-rf-green mb-4">Atividades Recentes</h3>
      <div className="space-y-3">
        {atividades.map((atividade) => (
          <div
            key={atividade.id}
            className="border-l-4 border-rf-green pl-4 py-2 dark:border-l-rf-green"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">
                  {atividade.apostila.titulo}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {atividade.acao === 'STATUS_MUDOU' ? '📊 Status alterado' : '📝 Ação registrada'}
                </p>
              </div>
              <span className="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded ml-2 flex-shrink-0">
                {APOSTILA_STATUS[atividade.statusNovo].label}
              </span>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Por <span className="font-medium dark:text-gray-300">{atividade.usuario.nome}</span> • {new Date(atividade.criadoEm).toLocaleString('pt-BR')}
            </p>

            {atividade.descricao && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">
                {atividade.descricao}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
