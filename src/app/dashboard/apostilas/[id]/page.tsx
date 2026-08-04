'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { StatusBadge } from '@/components/cards/StatusBadge'
import { FileUploadForm } from '@/components/forms/FileUploadForm'
import { EditorConteudoForm } from '@/components/forms/EditorConteudoForm'
import { ArquivosList } from '@/components/cards/ArquivosList'
import { ConteudoCard } from '@/components/dashboard/ConteudoCard'
import { ProblemasDiagramacaoCard } from '@/components/professor/ProblemasDiagramacaoCard'
import { FormattedDate } from '@/components/common/FormattedDate'
import { APOSTILA_STATUS, SERIES } from '@/lib/constants'
import type { ApostilaArquivo } from '@/types'

export default function ApostilaDetailPage() {
  const router = useRouter()
  const params = useParams()
  useUser()
  const id = params.id as string

  const [apostila, setApostila] = useState<any>(null)
  const [arquivos, setArquivos] = useState<ApostilaArquivo[]>([])
  const [conteudos, setConteudos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [conteudoEditando, setConteudoEditando] = useState<any>(null)
  const [, setDeletingId] = useState<string | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchApostila()
  }, [id])

  useEffect(() => {
    if (conteudoEditando && editorRef.current) {
      editorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [conteudoEditando])

  async function fetchApostila() {
    setLoading(true)
    try {
      const response = await fetch(`/api/apostilas/${id}`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setApostila(data.data)
        setArquivos(data.data.arquivos || [])
        fetchConteudos()
      } else {
        setError('Apostila não encontrada')
      }
    } catch (err) {
      setError('Erro ao carregar apostila')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchConteudos() {
    try {
      const response = await fetch(`/api/conteudo-capitulos?apostilaId=${id}`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setConteudos(data.data || [])
      }
    } catch (err) {
      console.error('Erro ao buscar conteúdos:', err)
    }
  }

  async function handleDeleteConteudo(conteudoId: string) {
    setDeletingId(conteudoId)
    try {
      const response = await fetch(`/api/conteudo-capitulos/${conteudoId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        setConteudos((prev) => prev.filter((c) => c.id !== conteudoId))
        alert('Capítulo deletado com sucesso!')
      } else {
        alert('Erro ao deletar capítulo')
      }
    } catch (err) {
      alert('Erro na conexão')
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  async function handleEditConteudo(conteudo: any) {
    setConteudoEditando(conteudo)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    )
  }

  if (error || !apostila) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={() => router.push('/dashboard/apostilas')}
          className="btn-secondary"
        >
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => router.push('/dashboard/apostilas')}
        className="text-rf-green hover:underline mb-4"
      >
        ← Voltar para Apostilas
      </button>

      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{apostila.titulo}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {apostila.materia} • {SERIES[apostila.serie as keyof typeof SERIES].label}
            </p>
          </div>
          <StatusBadge status={apostila.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Série</h3>
          <p className="text-sm text-gray-900 dark:text-white">{SERIES[apostila.serie as keyof typeof SERIES].label}</p>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Matéria</h3>
          <p className="text-sm text-gray-900 dark:text-white">{apostila.materia}</p>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Criado em</h3>
          <p className="text-sm text-gray-900 dark:text-white">
            <FormattedDate date={apostila.criadoEm} />
          </p>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Último update</h3>
          <p className="text-sm text-gray-900 dark:text-white">
            <FormattedDate date={apostila.atualizadoEm} />
          </p>
        </div>
      </div>

      {apostila.observacoes && (
        <div className="card mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Observações</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{apostila.observacoes}</p>
        </div>
      )}

      {/* Upload de Arquivos */}
      <div className="card mt-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Enviar Conteúdo</h2>
        <FileUploadForm
          apostilaId={id}
          tipo="PROFESSOR"
          onSuccess={fetchApostila}
        />
      </div>

      {/* Lista de Arquivos */}
      <div className="card mt-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Arquivos Enviados</h2>
        <ArquivosList arquivos={arquivos} />
      </div>

      {/* Editor Estruturado de Conteúdo */}
      <div className="card mt-8" ref={editorRef}>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {conteudoEditando ? '✏️ Editando Capítulo' : 'Escrever Conteúdo'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
          {conteudoEditando
            ? `Editando: ${conteudoEditando.capitulo}`
            : 'Escreva o conteúdo diretamente na plataforma com estrutura pré-definida'}
        </p>
        <EditorConteudoForm
          apostilaId={id}
          materia={apostila?.materia}
          serie={apostila?.serie}
          onSuccess={() => {
            fetchConteudos()
            setConteudoEditando(null)
          }}
          conteudoEditando={conteudoEditando}
          onCancelEdit={() => setConteudoEditando(null)}
        />
      </div>

      {/* Lista de Conteúdos Criados */}
      {conteudos.length > 0 && (
        <div className="card mt-8 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Capítulos Criados ({conteudos.length})</h2>
          <div className="space-y-2">
            {conteudos.map((conteudo) => {
              const grupoLabel = conteudo.grupoConteudo === 'NATUREZAS_MATEMATICA'
                ? 'Naturezas e Matemática'
                : 'Humanas e Linguagens'
              return (
                <div
                  key={conteudo.id}
                  className="flex justify-between items-start p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 hover:shadow-sm transition"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{conteudo.capitulo}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Frente {conteudo.frente} • {grupoLabel} • {conteudo.tipo === 'CONTEUDO' ? 'Conteúdo' : 'Revisão'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditConteudo(conteudo)}
                      className="text-xs px-2 py-1 rounded text-rf-green hover:bg-rf-green/10 transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Tem certeza?')) {
                          handleDeleteConteudo(conteudo.id)
                        }
                      }}
                      className="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                    >
                      Deletar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Problemas de Diagramação */}
      <div className="mt-8">
        <ProblemasDiagramacaoCard apostilaId={id} />
      </div>
    </div>
  )
}
