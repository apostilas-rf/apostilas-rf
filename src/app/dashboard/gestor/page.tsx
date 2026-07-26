'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Apostila {
  id: string
  titulo: string
  materia: string
  serie: string
  status: string
  bimestre: string
  tipo: 'HUMANAS' | 'NATUREZAS'
  prazoEntrega: string
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

export default function GestorPage() {
  const [apostilas, setApostilas] = useState<Apostila[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchApostilas()
  }, [])

  async function fetchApostilas() {
    try {
      setLoading(true)
      const response = await fetch('/api/apostilas/em-producao', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setApostilas(data.data || [])
      } else {
        setError('Erro ao carregar apostilas')
      }
    } catch (err) {
      setError('Erro na conexão')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

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

  const getDiasRestantes = (prazo: string) => {
    if (!prazo) return 0
    const hoje = new Date()
    const prazoDt = new Date(prazo)
    if (isNaN(prazoDt.getTime())) return 0
    const diff = Math.ceil((prazoDt.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    return diff
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

  const getStatusColor = (dias: number) => {
    if (dias < 0) return 'text-red-600 dark:text-red-400'
    if (dias <= 3) return 'text-amber-600 dark:text-amber-400'
    return 'text-green-600 dark:text-green-400'
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Dashboard do Gestor</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Acompanhamento de apostilas em produção ({apostilas.length}/2)
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {apostilas.length === 0 ? (
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
        <div className="space-y-6">
          {apostilas.map((apostila) => {
            const diasRestantes = getDiasRestantes(apostila.prazoEntrega)
            const percentualConteudo = (apostila.conteudoRecebido / apostila.conteudoTotal) * 100
            const percentualDiagramacao = (apostila.diagramacaoCompleta / apostila.diagramacaoTotal) * 100
            const percentualRevisao = (apostila.revisaoCompleta / apostila.revisaoTotal) * 100

            return (
              <div
                key={apostila.id}
                className="card p-6 dark:bg-gray-800 dark:border-gray-700"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {apostila.titulo}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {apostila.materia} • {apostila.serie} • {apostila.bimestre}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${getStatusColor(diasRestantes)}`}>
                      {diasRestantes >= 0 ? `${diasRestantes}d` : `${Math.abs(diasRestantes)}d atrasado`}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Até {formatarData(apostila.prazoEntrega)}
                    </p>
                  </div>
                </div>

                {/* Alertas */}
                {apostila.alertas.length > 0 && (
                  <div className="mb-6 space-y-2">
                    {apostila.alertas.map((alerta, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border ${getAlertColor(alerta.tipo)}`}
                      >
                        <p className={`text-sm font-medium ${getAlertTextColor(alerta.tipo)}`}>
                          {alerta.tipo === 'CRITICO' ? '🔴' : alerta.tipo === 'AVISO' ? '⚠️' : 'ℹ️'}{' '}
                          {alerta.mensagem}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Progress Bars */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {/* Conteúdo */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Conteúdo
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {apostila.conteudoRecebido}/{apostila.conteudoTotal}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(percentualConteudo, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Diagramação */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Diagramação
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {apostila.diagramacaoCompleta}/{apostila.diagramacaoTotal}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-purple-600 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(percentualDiagramacao, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Revisão */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Revisão
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {apostila.revisaoCompleta}/{apostila.revisaoTotal}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(percentualRevisao, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-end">
                  <Link
                    href={`/dashboard/apostilas/${apostila.id}`}
                    className="px-4 py-2 rounded-full bg-rf-green text-white font-medium hover:bg-emerald-600 transition-colors"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
