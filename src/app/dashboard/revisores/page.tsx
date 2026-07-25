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
  EM_CONFECCAO: '🎨 Em Confecção',
  EM_REVISAO_POS_EDICAO: '🔍 Em Revisão Pós-Edição',
  EM_AJUSTE: '⚙️ Em Ajuste',
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
              {['todos', 'EM_CONFECCAO', 'EM_REVISAO_POS_EDICAO', 'EM_AJUSTE'].map((status) => (
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
            <div className="space-y-4">
              {filtradas.map((apostila) => (
                <div key={apostila.id} className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/50 overflow-hidden">
                  <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {apostila.titulo}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {apostila.materia} • {apostila.serie}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          👤 Professor: {apostila.professor.nome}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                          {statusLabels[apostila.status] || apostila.status}
                        </span>
                        {apostila.comentarios.length > 0 && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                            💬 {apostila.comentarios.length} apontamentos
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arquivos */}
                    {apostila.arquivos.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📄 Arquivos:</p>
                        <div className="space-y-1">
                          {apostila.arquivos.map((arquivo) => (
                            <a
                              key={arquivo.id}
                              href={arquivo.googleDriveUrl || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline block"
                            >
                              📎 {arquivo.nomeOriginal}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/dashboard/revisores/${apostila.id}`}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded font-medium transition-colors"
                      >
                        Revisar
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
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
