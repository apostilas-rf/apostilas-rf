'use client'

import { SERIES } from '@/lib/constants'

interface SerieProgressCardProps {
  serie: string
  total: number
  concluidas: number
  atrasadas: number
}

export function SerieProgressCard({
  serie,
  total,
  concluidas,
  atrasadas,
}: SerieProgressCardProps) {
  const percentualConclusao = total > 0 ? Math.round((concluidas / total) * 100) : 0

  return (
    <div className="card dark:bg-gray-800/50 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-rf-green">
          {SERIES[serie as keyof typeof SERIES].label}
        </h3>
        <span className="text-2xl font-bold text-rf-green">{percentualConclusao}%</span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Progresso</span>
          <span className="text-gray-900 dark:text-gray-300 font-medium">
            {concluidas}/{total}
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-rf-green h-2 rounded-full transition-all"
            style={{ width: `${percentualConclusao}%` }}
          />
        </div>
      </div>

      {atrasadas > 0 && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-medium">{atrasadas}</span> apostila(s) atrasada(s)
          </p>
        </div>
      )}
    </div>
  )
}
