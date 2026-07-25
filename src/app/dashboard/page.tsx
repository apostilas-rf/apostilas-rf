'use client'

import { useState, useEffect } from 'react'
import { SerieProgressCard } from '@/components/dashboard/SerieProgressCard'
import { StatusChart } from '@/components/dashboard/StatusChart'
import { ActivityLog } from '@/components/dashboard/ActivityLog'
import { SERIES } from '@/lib/constants'

interface DashboardData {
  totalApostilas: number
  porSerie: Record<string, { total: number; concluidas: number; atrasadas: number }>
  porStatus: Record<string, number>
  atividades: any[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const response = await fetch('/api/dashboard/stats', {
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        setData(result.data)
      } else {
        setError('Erro ao carregar estatísticas')
      }
    } catch (err) {
      setError('Erro ao carregar dados do dashboard')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400">Carregando dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchStats}
          className="btn-primary"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Nenhum dado disponível</div>
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="section-title dark:text-white">📊 Dashboard</h1>
        <p className="section-subtitle dark:text-gray-400">
          Acompanhamento em tempo real de produção de apostilas
        </p>
      </div>

      {/* Card Total */}
      <div className="card-elevated dark:bg-gray-800/50 dark:border-gray-700 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">Total de Apostilas</p>
            <p className="text-6xl font-bold text-rf-green mt-4">{data.totalApostilas}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Em produção</p>
          </div>
          <div className="text-8xl opacity-10 group-hover:opacity-20 transition-opacity duration-300">📚</div>
        </div>
      </div>

      {/* Progresso por Série */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-rf-green mb-6 flex items-center gap-2">
          <span>📈</span> Progresso por Série
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(SERIES).map((serie) => (
            <SerieProgressCard
              key={serie}
              serie={serie}
              total={data.porSerie[serie]?.total || 0}
              concluidas={data.porSerie[serie]?.concluidas || 0}
              atrasadas={data.porSerie[serie]?.atrasadas || 0}
            />
          ))}
        </div>
      </div>

      {/* Gráfico de Status */}
      <StatusChart data={data.porStatus} />

      {/* Atividades Recentes */}
      <ActivityLog atividades={data.atividades} />

      {/* Rodapé com Última Atualização */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-6 border-t border-gray-200 dark:border-gray-700">
        <p>Última atualização: <span className="font-semibold dark:text-gray-300">{new Date().toLocaleString('pt-BR')}</span></p>
      </div>
    </div>
  )
}
