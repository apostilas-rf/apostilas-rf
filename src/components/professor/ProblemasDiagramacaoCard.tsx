'use client'

import { useState, useEffect } from 'react'

interface Problema {
  id: string
  descricao: string
  status: string
  respostaProf?: string
  respondidoEm?: Date
  criadoEm: Date
  diagramador: {
    nome: string
    email: string
  }
}

interface ProblemasDiagramacaoCardProps {
  apostilaId: string
}

export function ProblemasDiagramacaoCard({ apostilaId }: ProblemasDiagramacaoCardProps) {
  const [problemas, setProblemas] = useState<Problema[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [respondendo, setRespondendo] = useState<string | null>(null)
  const [respostaTexto, setRespostaTexto] = useState('')
  const [submittingId, setSubmittingId] = useState<string | null>(null)

  useEffect(() => {
    fetchProblemas()
  }, [])

  async function fetchProblemas() {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/diagramadores/problemas?apostilaId=${apostilaId}`,
        { credentials: 'include' }
      )

      if (!response.ok) throw new Error('Erro ao buscar problemas')

      const data = await response.json()
      setProblemas(data.data || [])
      setError('')
    } catch (err) {
      setError('Erro ao carregar problemas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleResponder(problemaId: string) {
    if (respostaTexto.trim().length < 5) {
      alert('Resposta deve ter no mínimo 5 caracteres')
      return
    }

    setSubmittingId(problemaId)

    try {
      const response = await fetch(
        `/api/diagramadores/problemas/${problemaId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ respostaProf: respostaTexto }),
        }
      )

      if (!response.ok) throw new Error('Erro ao responder')

      alert('Resposta enviada com sucesso! Email enviado ao diagramador.')
      setRespondendo(null)
      setRespostaTexto('')
      fetchProblemas()
    } catch (err) {
      alert('Erro ao enviar resposta')
      console.error(err)
    } finally {
      setSubmittingId(null)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rf-green"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card bg-red-50 border border-red-200">
        <p className="text-red-700">{error}</p>
      </div>
    )
  }

  if (problemas.length === 0) {
    return (
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 mb-4">📋 Problemas de Diagramação</h2>
        <p className="text-gray-600 text-center py-8">
          Nenhum problema reportado pelos diagramadores.
        </p>
      </div>
    )
  }

  const problemasAbertos = problemas.filter((p) => p.status === 'ABERTO')
  const problemasRespondidos = problemas.filter((p) => p.status !== 'ABERTO')

  return (
    <div className="card">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        📋 Problemas de Diagramação ({problemas.length})
      </h2>

      {/* Problemas abertos */}
      {problemasAbertos.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm">
              {problemasAbertos.length} ABERTO(S)
            </span>
          </h3>

          <div className="space-y-4">
            {problemasAbertos.map((problema) => (
              <div key={problema.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{problema.descricao}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Reportado por: <strong>{problema.diagramador.nome}</strong>
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                    ABERTO
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-3">
                  {new Date(problema.criadoEm).toLocaleDateString('pt-BR')}
                </p>

                {respondendo === problema.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={respostaTexto}
                      onChange={(e) => setRespostaTexto(e.target.value)}
                      placeholder="Escreva sua resposta ao diagramador..."
                      rows={3}
                      className="input-base resize-none"
                      disabled={submittingId === problema.id}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResponder(problema.id)}
                        disabled={submittingId === problema.id || respostaTexto.length < 5}
                        className="px-3 py-2 bg-rf-green text-white rounded font-medium hover:bg-opacity-90 disabled:bg-gray-300"
                      >
                        {submittingId === problema.id ? 'Enviando...' : 'Enviar Resposta'}
                      </button>
                      <button
                        onClick={() => {
                          setRespondendo(null)
                          setRespostaTexto('')
                        }}
                        className="px-3 py-2 bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setRespondendo(problema.id)}
                    className="text-rf-green font-medium text-sm hover:underline"
                  >
                    ↓ Responder
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Problemas respondidos */}
      {problemasRespondidos.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
              {problemasRespondidos.length} RESPONDIDO(S)
            </span>
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {problemasRespondidos.map((problema) => (
              <div key={problema.id} className="p-3 bg-gray-50 border border-gray-200 rounded">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-gray-900">{problema.descricao}</p>
                  <span className={`px-2 py-1 text-xs rounded font-medium ${
                    problema.status === 'RESPONDIDO'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {problema.status}
                  </span>
                </div>

                <p className="text-xs text-gray-600 mb-2">
                  {problema.diagramador.nome} • {new Date(problema.criadoEm).toLocaleDateString('pt-BR')}
                </p>

                {problema.respostaProf && (
                  <div className="p-2 bg-green-50 border-l-2 border-green-600 rounded mt-2">
                    <p className="text-xs font-medium text-green-900 mb-1">Sua resposta:</p>
                    <p className="text-sm text-gray-700">{problema.respostaProf}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
