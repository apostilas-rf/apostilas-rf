'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Conteudo {
  id: string
  capitulo: string
  frente: string
  tipo: string
  status: string
  conteudo: string
  estimadoPaginas: number | null
  paginasUtilizadas: number | null
  criadoEm: Date
  atualizadoEm: Date
}

interface Apostila {
  id: string
  titulo: string
  materia: string
  serie: string
  status: string
  prazoEstimado: Date | null
  conteudosCapitulos: Conteudo[]
  template: any
}

const statusLabels: Record<string, string> = {
  NAO_INICIADO: 'Não Iniciado',
  EM_EDICAO: 'Em Edição',
  ENVIADO_REVISAO: 'Enviado para Revisão',
  EM_REVISAO: 'Em Revisão',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
}

const statusColors: Record<string, string> = {
  NAO_INICIADO: 'bg-gray-100 text-gray-700 dark:text-gray-300',
  EM_EDICAO: 'bg-blue-100 text-blue-700',
  ENVIADO_REVISAO: 'bg-yellow-100 text-yellow-700',
  EM_REVISAO: 'bg-orange-100 text-orange-700',
  APROVADO: 'bg-green-100 text-green-700',
  REJEITADO: 'bg-red-100 text-red-700',
}

export default function MeusCapitulosPage() {
  const [apostilas, setApostilas] = useState<Apostila[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedApostila, setExpandedApostila] = useState<string | null>(null)

  useEffect(() => {
    fetchApostilas()
  }, [])

  async function fetchApostilas() {
    try {
      setLoading(true)
      const response = await fetch('/api/professores/apostilas', {
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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📚 Meus Capítulos</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Edite e envie o conteúdo dos capítulos das suas apostilas</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button
            onClick={fetchApostilas}
            className="ml-4 font-medium underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {apostilas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-lg">Nenhuma apostila encontrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {apostilas.map((apostila) => {
            const capitulos = apostila.conteudosCapitulos || []
            const capitulosCompletos = capitulos.filter(c => c.status === 'APROVADO').length

            return (
              <div key={apostila.id} className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/50">
                <div
                  onClick={() =>
                    setExpandedApostila(
                      expandedApostila === apostila.id ? null : apostila.id
                    )
                  }
                  className="cursor-pointer p-4 hover:bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {apostila.titulo}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {apostila.materia} • {apostila.serie}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-rf-green">
                        {capitulosCompletos}/{capitulos.length}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Capítulos completos</p>
                    </div>
                  </div>

                  {apostila.prazoEstimado && (
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      📅 Prazo: {new Date(apostila.prazoEstimado).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>

                {expandedApostila === apostila.id && capitulos.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="space-y-2">
                      {capitulos.map((cap) => (
                        <div
                          key={cap.id}
                          className="flex justify-between items-center p-3 bg-white dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700 hover:border-rf-green"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {cap.capitulo}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Tipo: {cap.tipo} • Frente: {cap.frente}
                            </p>
                            {cap.estimadoPaginas && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Limite de páginas: {cap.estimadoPaginas}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 ml-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                statusColors[cap.status] || 'bg-gray-100 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {statusLabels[cap.status] || cap.status}
                            </span>

                            {cap.status !== 'APROVADO' && cap.status !== 'REJEITADO' && (
                              <Link
                                href={`/dashboard/meus-capitulos/${cap.id}/editar`}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium text-sm"
                              >
                                Editar
                              </Link>
                            )}

                            {cap.status === 'REJEITADO' && (
                              <Link
                                href={`/dashboard/meus-capitulos/${cap.id}/editar`}
                                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 font-medium text-sm"
                              >
                                Corrigir
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
