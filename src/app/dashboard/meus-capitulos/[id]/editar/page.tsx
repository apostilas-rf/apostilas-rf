'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ConteudoEditor from '@/components/editor/ConteudoEditor'

interface Conteudo {
  id: string
  capitulo: string
  frente: string
  tipo: string
  status: string
  conteudo: string
  estimadoPaginas: number | null
  paginasUtilizadas: number | null
  topicos: string[]
  imagensUrls: string[]
  enemTopico: string | null
  enemEstrelas: number | null
  criadoEm: Date
  atualizadoEm: Date
  apostila: {
    id: string
    titulo: string
    materia: string
    serie: string
    template: any
  }
}

export default function EditarCapituloPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [conteudo, setConteudo] = useState<Conteudo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  useEffect(() => {
    fetchConteudo()
  }, [id])

  async function fetchConteudo() {
    try {
      setLoading(true)
      const response = await fetch(`/api/conteudos/${id}`, {
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Erro ao buscar conteúdo')

      const data = await response.json()
      setConteudo(data.data)
      setError('')
    } catch (err) {
      setError('Erro ao carregar conteúdo')
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
          <p className="text-gray-600">Carregando capítulo...</p>
        </div>
      </div>
    )
  }

  if (!conteudo) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Capítulo não encontrado</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          ← Voltar
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          ✏️ {conteudo.capitulo}
        </h1>
        <p className="text-gray-600 mt-2">
          {conteudo.apostila.titulo} • {conteudo.apostila.materia}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {showSuccessMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          ✓ Conteúdo salvo com sucesso!
        </div>
      )}

      <ConteudoEditor
        conteudo={conteudo}
        onSave={async (dados) => {
          setIsSaving(true)
          try {
            const response = await fetch(`/api/conteudos/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(dados),
            })

            if (!response.ok) throw new Error('Erro ao salvar')

            const data = await response.json()
            setConteudo(data.data)
            setShowSuccessMessage(true)
            setTimeout(() => setShowSuccessMessage(false), 3000)
          } catch (err) {
            setError('Erro ao salvar conteúdo')
            console.error(err)
          } finally {
            setIsSaving(false)
          }
        }}
        onEnviarRevisao={async () => {
          setIsSaving(true)
          try {
            const response = await fetch(`/api/conteudos/${id}/enviar-revisao`, {
              method: 'POST',
              credentials: 'include',
            })

            if (!response.ok) {
              const data = await response.json()
              throw new Error(data.error || 'Erro ao enviar para revisão')
            }

            const data = await response.json()
            setConteudo(data.data)
            setShowSuccessMessage(true)
            setTimeout(() => {
              router.push('/dashboard/meus-capitulos')
            }, 1500)
          } catch (err: any) {
            setError(err.message || 'Erro ao enviar para revisão')
            console.error(err)
          } finally {
            setIsSaving(false)
          }
        }}
        isSaving={isSaving}
      />
    </div>
  )
}
