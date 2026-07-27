'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PrazosTab } from '@/components/prazos/PrazosTab'

interface Arquivo {
  id: string
  nomeOriginal: string
  googleDriveUrl?: string
  criadoEm: Date
}

interface Comentario {
  id: string
  conteudo: string
  tipo: string
  criadoEm: Date
  usuario: {
    id: string
    nome: string
    role: string
  }
}

interface Apostila {
  id: string
  titulo: string
  materia: string
  serie: string
  status: string
  professor: {
    id: string
    nome: string
    email: string
  }
  arquivos: Arquivo[]
  comentarios: Comentario[]
  atribuicoes: Array<{ usuario: { id: string; nome: string } }>
}

const statusLabels: Record<string, string> = {
  EM_DIAGRAMACAO: '🎨 Em diagramação',
  EM_REVISAO_FINAL: '🔍 Em revisão final',
  EM_AJUSTE: '⚙️ Em ajuste',
}

export default function RevisoresPage() {
  const [apostilas, setApostilas] = useState<Apostila[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [abaAtiva, setAbaAtiva] = useState<'apostilas' | 'prazos'>('apostilas')

  useEffect(() => {
    fetchApostilas()
  }, [])

  async function fetchApostilas() {
    try {
      setLoading(true)
      const response = await fetch('/api/revisores/apostilas', {
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Erro ao buscar apostilas')

      const data = await response.json()
      setApostilas(data.data || [])
      setError('')
    } catch (err) {
      setError('Erro ao carregar apostilas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function getApostilasFiltradas() {
    if (filtroStatus === 'todos') return apostilas
    return apostilas.filter((a) => a.status === filtroStatus)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rf-green mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando apostilas para revisão...</p>
        </div>
      </div>
    )
  }

  const filtradas = getApostilasFiltradas()
  const comApontamentos = filtradas.filter((a) => a.comentarios.length > 0).length
  const semApontamentos = filtradas.length - comApontamentos

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🔍 Revisão de Apostilas</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Revise, corrija e faça apontamentos nos arquivos finalizados
        </p>

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

          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Pendente</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{filtradas.length}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Com Apontamentos</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{comApontamentos}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Sem Apontamentos</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{semApontamentos}</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Filtros</h2>
            <div className="flex gap-2 flex-wrap">
              {['todos', 'EM_DIAGRAMACAO', 'EM_REVISAO_FINAL', 'EM_AJUSTE'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFiltroStatus(status)}
                  className={`px-4 py-2 rounded font-medium ${
                    filtroStatus === status
                      ? 'bg-rf-green text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {status === 'todos' ? 'Todas' : statusLabels[status] || status}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Apostilas */}
          {filtradas.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {loading ? 'Carregando...' : 'Nenhuma apostila para revisar'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtradas.map((apostila) => {
                const temApontamentos = apostila.comentarios.length > 0
                const statusApostila = statusLabels[apostila.status] || apostila.status

                return (
                  <div
                    key={apostila.id}
                    className={`rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border-l-4 ${
                      temApontamentos
                        ? 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/20'
                        : 'border-l-green-500 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="p-6 bg-white dark:bg-gray-800">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {apostila.titulo}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {apostila.materia} • {apostila.serie}
                          </p>
                        </div>
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                          temApontamentos
                            ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                            : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        }`}>
                          {temApontamentos ? '💬 Apontamentos' : '✓ Pronto'}
                        </span>
                      </div>

                      {/* Professor Info */}
                      <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Professor:</span> {apostila.professor.nome}
                        </p>
                      </div>

                      {/* Status e Apontamentos */}
                      <div className="mb-4 grid grid-cols-2 gap-3">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Status</p>
                          <p className="text-sm text-blue-900 dark:text-blue-200 font-bold">
                            {statusApostila}
                          </p>
                        </div>
                        <div className={`p-3 rounded-lg border ${
                          temApontamentos
                            ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800'
                            : 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800'
                        }`}>
                          <p className={`text-xs font-medium mb-1 ${
                            temApontamentos
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            Apontamentos
                          </p>
                          <p className={`text-sm font-bold ${
                            temApontamentos
                              ? 'text-amber-900 dark:text-amber-200'
                              : 'text-green-900 dark:text-green-200'
                          }`}>
                            {apostila.comentarios.length > 0 ? `${apostila.comentarios.length}` : '0'}
                          </p>
                        </div>
                      </div>

                      {/* Arquivos */}
                      {apostila.arquivos.length > 0 && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                            📄 {apostila.arquivos.length} arquivo(s)
                          </p>
                          <div className="space-y-1">
                            {apostila.arquivos.slice(0, 2).map((arquivo) => (
                              <a
                                key={arquivo.id}
                                href={arquivo.googleDriveUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 truncate"
                              >
                                📎 {arquivo.nomeOriginal}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Apontamentos Resumo */}
                      {temApontamentos && (
                        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2">
                            ⚠️ {apostila.comentarios.length} apontamento(s) para revisar
                          </p>
                          <div className="space-y-1 max-h-16 overflow-y-auto">
                            {apostila.comentarios.slice(0, 2).map((comentario) => (
                              <p key={comentario.id} className="text-xs text-amber-900 dark:text-amber-200">
                                • {comentario.conteudo.substring(0, 40)}...
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Botão de Ação */}
                      <Link href={`/dashboard/revisores/${apostila.id}`}>
                        <button className="w-full px-4 py-2 bg-rf-green hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors text-sm">
                          → Revisar
                        </button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {abaAtiva === 'prazos' && (
        <div className="mt-6">
          <PrazosTab setorId="REVISAO" setorLabel="Revisão" />
        </div>
      )}
    </div>
  )
}
