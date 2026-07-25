'use client'

import { useEffect, useState } from 'react'
import { ApostilaCard } from '@/components/diagramadores/ApostilaCard'
import { PrazosTab } from '@/components/prazos/PrazosTab'

interface Arquivo {
  id: string
  nomeOriginal: string
  tipo: string
  googleDriveUrl?: string
}

interface Progresso {
  paginaInicio?: number
  paginaFim?: number
  paginasTotal?: number
  percentualProgresso?: number
}

interface Problema {
  id: string
  descricao: string
  status: string
  criadoEm: Date
}

interface Apostila {
  id: string
  titulo: string
  materia: string
  serie: string
  status: string
  professor: { nome: string }
  arquivos: Arquivo[]
  diagramacaoProgresos: Progresso[]
  problemasRelatados: Problema[]
}

export default function DiagramadoresPage() {
  const [apostilas, setApostilas] = useState<Apostila[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState<'todas' | 'pendentes' | 'em_progresso' | 'completas'>('todas')
  const [abaAtiva, setAbaAtiva] = useState<'apostilas' | 'prazos'>('apostilas')

  useEffect(() => {
    fetchApostilas()
  }, [])

  async function fetchApostilas() {
    try {
      setLoading(true)
      const response = await fetch('/api/diagramadores/apostilas', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar apostilas')
      }

      const data = await response.json()
      setApostilas(data.data || [])
      setError('')
    } catch (err) {
      setError('Erro ao carregar apostilas. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function getApostilasFiltrads() {
    return apostilas.filter((apostila) => {
      const progresso = apostila.diagramacaoProgresos[0]?.percentualProgresso || 0

      switch (filtro) {
        case 'pendentes':
          return progresso === 0
        case 'em_progresso':
          return progresso > 0 && progresso < 100
        case 'completas':
          return progresso === 100
        default:
          return true
      }
    })
  }

  const apostilasFiltrads = getApostilasFiltrads()

  const stats = {
    total: apostilas.length,
    pendentes: apostilas.filter((a) => (a.diagramacaoProgresos[0]?.percentualProgresso || 0) === 0).length,
    emProgresso: apostilas.filter((a) => {
      const p = a.diagramacaoProgresos[0]?.percentualProgresso || 0
      return p > 0 && p < 100
    }).length,
    completas: apostilas.filter((a) => (a.diagramacaoProgresos[0]?.percentualProgresso || 0) === 100).length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rf-green mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando apostilas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">📐 Diagramação</h1>
        <p className="text-gray-600 dark:text-gray-400">Gerencie sua diagramação e acompanhe o progresso das apostilas</p>

        {/* Abas */}
        <div className="flex gap-2 mt-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setAbaAtiva('apostilas')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              abaAtiva === 'apostilas'
                ? 'border-rf-green text-rf-green'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            Apostilas
          </button>
          <button
            onClick={() => setAbaAtiva('prazos')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              abaAtiva === 'prazos'
                ? 'border-rf-green text-rf-green'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            Prazos
          </button>
        </div>
      </div>

      {abaAtiva === 'apostilas' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Atribuído</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Pendentes</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{stats.pendentes}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Em Progresso</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{stats.emProgresso}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Completas</p>
              <p className="text-3xl font-bold text-rf-green mt-2">{stats.completas}</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {(['todas', 'pendentes', 'em_progresso', 'completas'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-4 py-2 rounded font-medium whitespace-nowrap transition-colors ${
                  filtro === f
                    ? 'bg-rf-green text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {f === 'todas' && 'Todas'}
                {f === 'pendentes' && 'Pendentes'}
                {f === 'em_progresso' && 'Em Progresso'}
                {f === 'completas' && 'Completas'}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 rounded">
              {error}
              <button
                onClick={fetchApostilas}
                className="ml-4 font-medium underline hover:no-underline"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Lista de Apostilas */}
          {apostilasFiltrads.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apostilasFiltrads.map((apostila) => (
                <ApostilaCard
                  key={apostila.id}
                  {...apostila}
                  progresso={apostila.diagramacaoProgresos[0]}
                  onRefresh={fetchApostilas}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {apostilas.length === 0
                  ? 'Nenhuma apostila atribuída ainda.'
                  : `Nenhuma apostila ${filtro === 'todas' ? '' : `${filtro.replace('_', ' ')}`}`}
              </p>
            </div>
          )}
        </>
      )}

      {abaAtiva === 'prazos' && (
        <div className="mt-6">
          <PrazosTab setorId="DIAGRAMACAO" setorLabel="Diagramação" />
        </div>
      )}
    </div>
  )
}
