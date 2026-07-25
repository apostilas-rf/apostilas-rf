'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ComentarioForm from '@/components/revisor/ComentarioForm'

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

interface Arquivo {
  id: string
  nomeOriginal: string
  googleDriveUrl?: string
  criadoEm: Date
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
}

const statusLabels: Record<string, string> = {
  EM_CONFECCAO: '🎨 Em Confecção',
  EM_REVISAO_POS_EDICAO: '🔍 Em Revisão Pós-Edição',
  EM_AJUSTE: '⚙️ Em Ajuste',
}

export default function RevisorDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [apostila, setApostila] = useState<Apostila | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchApostila()
  }, [id])

  async function fetchApostila() {
    try {
      setLoading(true)
      const response = await fetch(`/api/apostilas/${id}`, {
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Erro ao buscar apostila')

      const data = await response.json()
      setApostila(data.data)
      setError('')
    } catch (err) {
      setError('Erro ao carregar apostila')
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
          <p className="text-gray-600 dark:text-gray-400">Carregando apostila...</p>
        </div>
      </div>
    )
  }

  if (!apostila) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Apostila não encontrada</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-rf-green hover:underline font-medium mb-4"
        >
          ← Voltar
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{apostila.titulo}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {apostila.materia} • {apostila.serie}
        </p>
        <span className="inline-block mt-3 px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-700">
          {statusLabels[apostila.status] || apostila.status}
        </span>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Coluna Principal - Arquivos e Apontamentos */}
        <div className="col-span-2 space-y-6">
          {/* Arquivos */}
          <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📄 Arquivos para Revisão</h2>
            {apostila.arquivos.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">Nenhum arquivo disponível</p>
            ) : (
              <div className="space-y-2">
                {apostila.arquivos.map((arquivo) => (
                  <a
                    key={arquivo.id}
                    href={arquivo.googleDriveUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 border border-gray-300 rounded hover:bg-blue-50 text-blue-600 hover:underline"
                  >
                    📎 {arquivo.nomeOriginal}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Form de Comentários */}
          <ComentarioForm
            apostilaId={apostila.id}
            onSuccess={() => {
              fetchApostila()
            }}
          />

          {/* Apontamentos Existentes */}
          <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              💬 Apontamentos ({apostila.comentarios.length})
            </h2>
            {apostila.comentarios.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">Nenhum apontamento realizado ainda</p>
            ) : (
              <div className="space-y-4">
                {apostila.comentarios.map((comentario) => (
                  <div key={comentario.id} className="border-l-4 border-blue-500 p-4 bg-blue-50 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {comentario.usuario.nome}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(comentario.criadoEm).toLocaleDateString('pt-BR')}{' '}
                          {new Date(comentario.criadoEm).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                      <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded">
                        {comentario.tipo}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mt-3">{comentario.conteudo}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Informações */}
        <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-6 h-fit">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">ℹ️ Informações</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">Professor</p>
              <p className="text-gray-900 dark:text-white font-medium">{apostila.professor.nome}</p>
              <a
                href={`mailto:${apostila.professor.email}`}
                className="text-blue-600 text-sm hover:underline"
              >
                {apostila.professor.email}
              </a>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-2">
                Resumo de Apontamentos
              </p>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-blue-600">
                    {apostila.comentarios.length}
                  </span>{' '}
                  apontamentos realizados
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-2">
                Categorias de Apontamentos
              </p>
              <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                <li>🔤 Erros de Ortografia</li>
                <li>📐 Erros de Diagramação</li>
                <li>💡 Sugestões de Melhoria</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
