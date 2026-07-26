'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SerieProgressCard } from '@/components/dashboard/SerieProgressCard'
import { StatusChart } from '@/components/dashboard/StatusChart'
import { ActivityLog } from '@/components/dashboard/ActivityLog'
import { SERIES } from '@/lib/constants'
import type { UserSession } from '@/types'

interface DashboardData {
  totalApostilas: number
  porSerie: Record<string, { total: number; concluidas: number; atrasadas: number }>
  porStatus: Record<string, number>
  atividades: any[]
}

interface Apostila {
  id: string
  titulo: string
  materia: string
  serie: string
  status: string
  bimestre: string
  tipo: 'HUMANAS' | 'NATUREZAS'
  prazoEntrega: string
  diasRestantes: number
  conteudoRecebido: number
  conteudoTotal: number
  diagramacaoCompleta: number
  diagramacaoTotal: number
  revisaoCompleta: number
  revisaoTotal: number
  alertas: Array<{
    tipo: 'CRITICO' | 'AVISO' | 'INFO'
    mensagem: string
    timestamp: string
  }>
}

export default function DashboardPage() {
  const [usuario, setUsuario] = useState<UserSession | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)
  const [apostilasProducao, setApostilasProducao] = useState<Apostila[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDados()
  }, [])

  async function fetchDados() {
    try {
      const [usuarioRes, statsRes, apostilasRes] = await Promise.all([
        fetch('/api/auth/me', { credentials: 'include' }),
        fetch('/api/dashboard/stats', { credentials: 'include' }),
        fetch('/api/apostilas/em-producao', { credentials: 'include' }),
      ])

      if (usuarioRes.ok) {
        const userData = await usuarioRes.json()
        if (userData.data) {
          setUsuario({
            id: userData.data.id,
            nome: userData.data.nome || 'Usuário',
            email: userData.data.email || '',
            role: userData.data.role || 'PROFESSOR',
            ativo: true,
            criadoEm: new Date(),
            atualizadoEm: new Date(),
          })
        }
      }

      if (statsRes.ok) {
        const result = await statsRes.json()
        setData(result.data)
      }

      if (apostilasRes.ok) {
        const result = await apostilasRes.json()
        setApostilasProducao(result.data || [])
      }
    } catch (err) {
      setError('Erro ao carregar dados do dashboard')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const isGestor = usuario?.role === 'GESTOR'

  const getAlertColor = (tipo: string) => {
    switch (tipo) {
      case 'CRITICO':
        return 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
      case 'AVISO':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
    }
  }

  const getAlertTextColor = (tipo: string) => {
    switch (tipo) {
      case 'CRITICO':
        return 'text-red-700 dark:text-red-300'
      case 'AVISO':
        return 'text-amber-700 dark:text-amber-300'
      default:
        return 'text-blue-700 dark:text-blue-300'
    }
  }

  const getStatusColor = (dias: number) => {
    if (dias < 0) return 'text-red-600 dark:text-red-400'
    if (dias <= 3) return 'text-amber-600 dark:text-amber-400'
    return 'text-green-600 dark:text-green-400'
  }

  const formatarData = (dataStr: string) => {
    if (!dataStr) return 'Não definido'
    try {
      const data = new Date(dataStr)
      if (isNaN(data.getTime())) return 'Não definido'
      return data.toLocaleDateString('pt-BR')
    } catch {
      return 'Não definido'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400">Carregando dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="section-title dark:text-white">📊 {isGestor ? 'Dashboard do Gestor' : 'Dashboard'}</h1>
        <p className="section-subtitle dark:text-gray-400">
          {isGestor ? 'Acompanhamento de apostilas em produção' : 'Acompanhamento em tempo real de produção de apostilas'}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Dashboard do Gestor - Apostilas em Produção */}
      {isGestor && (
        <div>
          {apostilasProducao.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhuma apostila em produção</p>
              <Link
                href="/dashboard/apostilas"
                className="inline-block px-4 py-2 rounded-full bg-rf-green text-white font-medium hover:bg-emerald-600"
              >
                Criar Apostila
              </Link>
            </div>
          ) : (
            <div className="space-y-6 mb-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                🚀 Apostilas em Produção ({apostilasProducao.length}/2)
              </h2>
              {apostilasProducao.map((apostila) => {
                const diasRestantes = apostila.diasRestantes
                const percentualConteudo = (apostila.conteudoRecebido / apostila.conteudoTotal) * 100
                const percentualDiagramacao = (apostila.diagramacaoCompleta / apostila.diagramacaoTotal) * 100
                const percentualRevisao = (apostila.revisaoCompleta / apostila.revisaoTotal) * 100

                return (
                  <div
                    key={apostila.id}
                    className="card p-4 dark:bg-gray-800 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                          {apostila.titulo}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          {apostila.materia} • {apostila.serie} • {apostila.bimestre}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`text-xl font-bold ${getStatusColor(diasRestantes)}`}>
                          {diasRestantes >= 0 ? `${diasRestantes}d` : `${Math.abs(diasRestantes)}d`}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatarData(apostila.prazoEntrega)}
                        </p>
                      </div>
                    </div>

                    {apostila.alertas.length > 0 && (
                      <div className="mb-3 space-y-1">
                        {apostila.alertas.map((alerta, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded text-xs border ${getAlertColor(alerta.tipo)}`}
                          >
                            <p className={`font-medium ${getAlertTextColor(alerta.tipo)}`}>
                              {alerta.tipo === 'CRITICO' ? '🔴' : alerta.tipo === 'AVISO' ? '⚠️' : 'ℹ️'} {alerta.mensagem}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Conteúdo</span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {apostila.conteudoRecebido}/{apostila.conteudoTotal}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(percentualConteudo, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Diagramação</span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {apostila.diagramacaoCompleta}/{apostila.diagramacaoTotal}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(percentualDiagramacao, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Revisão</span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {apostila.revisaoCompleta}/{apostila.revisaoTotal}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(percentualRevisao, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Link
                        href={`/dashboard/apostilas/${apostila.id}`}
                        className="text-xs px-3 py-1 rounded-full bg-rf-green text-white font-medium hover:bg-emerald-600 transition-colors"
                      >
                        Detalhes
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Dashboard Geral - Stats e Gráficos */}
      {data && (
        <>
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
        </>
      )}

      {/* Rodapé com Última Atualização */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-6 border-t border-gray-200 dark:border-gray-700">
        <p>Última atualização: <span className="font-semibold dark:text-gray-300">{new Date().toLocaleString('pt-BR')}</span></p>
      </div>
    </div>
  )
}
