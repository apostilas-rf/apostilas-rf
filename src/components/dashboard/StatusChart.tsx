'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { APOSTILA_STATUS } from '@/lib/constants'
import type { ApostilaStatus } from '@/types'

interface StatusChartProps {
  data: Record<string, number>
}

const COLORS = {
  RECEBIDO: '#9CA3AF',
  EM_REVISAO_INICIAL: '#FCD34D',
  EM_DIAGRAMACAO: '#A78BFA',
  EM_REVISAO_FINAL: '#F97316',
  EM_AJUSTE: '#EF4444',
  FINALIZADO: '#22C55E',
  ENVIADO: '#059669',
}

export function StatusChart({ data }: StatusChartProps) {
  const chartData = Object.entries(data)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: APOSTILA_STATUS[status as ApostilaStatus].label,
      value: count,
      status,
    }))

  if (chartData.length === 0) {
    return (
      <div className="card dark:bg-gray-800/50 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-rf-green mb-4">Distribuição por Status</h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Nenhuma apostila para exibir
        </div>
      </div>
    )
  }

  return (
    <div className="card dark:bg-gray-800/50 dark:border-gray-700">
      <h3 className="font-semibold text-gray-900 dark:text-rf-green mb-4">Distribuição por Status</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.status as ApostilaStatus]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} apostila(s)`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
