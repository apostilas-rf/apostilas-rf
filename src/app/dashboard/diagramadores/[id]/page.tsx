'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { ProgressForm } from '@/components/diagramadores/ProgressForm'
import { ProblemForm } from '@/components/diagramadores/ProblemForm'

interface Arquivo {
  id: string
  nomeOriginal: string
  tipo: string
  googleDriveUrl?: string
  criadoEm: Date
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
  respostaProf?: string
  criadoEm: Date
}

interface Apostila {
  id: string
  titulo: string
  materia: string
  serie: string
  status: string
  professor: { nome: string; email: string }
  arquivos: Arquivo[]
  diagramacaoProgresos: Progresso[]
  problemasRelatados: Problema[]
}

export default function DiagramadorApostilaPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const apostilaId = params.id as string
  const activeTab = searchParams.get('tab') || 'progresso'

  const [apostila, setApostila] = useState<Apostila | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchApostila()
  }, [])

  async function fetchApostila() {
    try {
      const response = await fetch(`/api/diagramadores/apostilas?id=${apostilaId}`, {
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Erro ao buscar apostila')

      const data = await response.json()
      const apostilaData = data.data.find((a: Apostila) => a.id === apostilaId)
      setApostila(apostilaData)
    } catch (err) {
      setError('Erro ao carregar apostila')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleTabChange(tab: string) {
    router.push(`/dashboard/diagramadores/${apostilaId}?tab=${tab}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rf-green"></div>
      </div>
    )
  }

  if (error || !apostila) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Apostila não encontrada'}
        </div>
        <button
          onClick={() => router.back()}
          className="mt-4 text-rf-green font-medium hover:underline"
        >
          ← Voltar
        </button>
      </div>
    )
  }

  const progresso = apostila.diagramacaoProgresos[0]
  const arquivosProfessor = apostila.arquivos.filter((a) => a.tipo === 'PROFESSOR')

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-rf-green font-medium hover:underline mb-4"
        >
          ← Voltar
        </button>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{apostila.titulo}</h1>
              <p className="text-gray-600 mt-2">
                {apostila.materia} • {apostila.serie}
              </p>
            </div>
            <span className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded">
              {apostila.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Professor:</span>
              <p className="text-gray-600">{apostila.professor.nome}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <p className="text-gray-600">{apostila.professor.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => handleTabChange('progresso')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'progresso'
              ? 'border-rf-green text-rf-green'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 Progresso
        </button>
        <button
          onClick={() => handleTabChange('problemas')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'problemas'
              ? 'border-rf-green text-rf-green'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          ⚠️ Problemas ({apostila.problemasRelatados.length})
        </button>
        {arquivosProfessor.length > 0 && (
          <button
            onClick={() => handleTabChange('arquivos')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'arquivos'
                ? 'border-rf-green text-rf-green'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📎 Arquivos
          </button>
        )}
      </div>

      {/* Conteúdo das abas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna esquerda - Progresso */}
        <div className="lg:col-span-2">
          {activeTab === 'progresso' && (
            <div className="space-y-6">
              <ProgressForm
                apostilaId={apostilaId}
                initialData={progresso}
                onSubmit={fetchApostila}
              />

              {progresso && (
                <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">Status Atual</h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700">Progresso Geral</span>
                        <span className="text-2xl font-bold text-rf-green">
                          {progresso.percentualProgresso || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-rf-green h-4 rounded-full transition-all"
                          style={{ width: `${progresso.percentualProgresso || 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-blue-50 rounded">
                        <p className="text-sm text-gray-600">Página Inicial</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {progresso.paginaInicio || '—'}
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded">
                        <p className="text-sm text-gray-600">Página Final</p>
                        <p className="text-2xl font-bold text-green-700">
                          {progresso.paginaFim || '—'}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-2xl font-bold text-gray-700">
                          {progresso.paginasTotal || '—'}
                        </p>
                      </div>
                    </div>

                    {progresso.paginaInicio && progresso.paginaFim && (
                      <p className="text-sm text-gray-600">
                        <strong>Páginas diagramadas:</strong> {progresso.paginaFim - progresso.paginaInicio + 1}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'problemas' && (
            <div className="space-y-6">
              <ProblemForm apostilaId={apostilaId} onSubmit={fetchApostila} />

              {apostila.problemasRelatados.length > 0 ? (
                <div className="space-y-3">
                  {apostila.problemasRelatados.map((problema) => (
                    <div key={problema.id} className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-900">
                          {problema.descricao}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded font-medium ${
                          problema.status === 'ABERTO'
                            ? 'bg-red-100 text-red-700'
                            : problema.status === 'RESPONDIDO'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {problema.status}
                        </span>
                      </div>

                      {problema.respostaProf && (
                        <div className="mt-3 p-3 bg-green-50 rounded">
                          <p className="text-sm font-medium text-green-900 mb-1">
                            ✅ Resposta do Professor
                          </p>
                          <p className="text-sm text-gray-700">{problema.respostaProf}</p>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(problema.criadoEm).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-600">Nenhum problema reportado ainda.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'arquivos' && (
            <div>
              {arquivosProfessor.length > 0 ? (
                <div className="space-y-3">
                  {arquivosProfessor.map((arquivo) => (
                    <a
                      key={arquivo.id}
                      href={arquivo.googleDriveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-rf-green hover:bg-green-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">📄 {arquivo.nomeOriginal}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(arquivo.criadoEm).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span className="text-rf-green font-medium">Abrir →</span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-600">Nenhum arquivo disponível.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Coluna direita - Resumo */}
        <div>
          <div className="sticky top-20 space-y-4">
            {/* Card de Progresso Resumido */}
            {progresso && (
              <div className="p-4 bg-gradient-to-br from-rf-green to-green-600 text-white rounded-lg">
                <p className="text-sm opacity-90 mb-1">Progresso</p>
                <p className="text-4xl font-bold">{progresso.percentualProgresso || 0}%</p>
                <p className="text-sm opacity-90 mt-2">
                  {progresso.paginaFim ? progresso.paginaFim - (progresso.paginaInicio || 0) + 1 : 0} páginas
                </p>
              </div>
            )}

            {/* Card de Problemas */}
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">Problemas</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="text-sm text-gray-700">Abertos</span>
                  <span className="font-bold text-red-600">
                    {apostila.problemasRelatados.filter((p) => p.status === 'ABERTO').length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                  <span className="text-sm text-gray-700">Respondidos</span>
                  <span className="font-bold text-yellow-600">
                    {apostila.problemasRelatados.filter((p) => p.status === 'RESPONDIDO').length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm text-gray-700">Resolvidos</span>
                  <span className="font-bold text-green-600">
                    {apostila.problemasRelatados.filter((p) => p.status === 'RESOLVIDO').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Nota */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>💡 Dica:</strong> Atualize o progresso regularmente para manter o professor informado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
