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
import { APOSTILA_STATUS, SERIES, STATUS_TRANSITIONS } from '@/lib/constants'
import type { ApostilaStatus, ApostilaArquivo } from '@/types'

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
  const [changeStatusLoading, setChangeStatusLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
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
        setSelectedStatus(data.data.status)
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


  async function handleStatusChange() {
    if (!selectedStatus || selectedStatus === apostila?.status) return

    setChangeStatusLoading(true)
    try {
      const response = await fetch(`/api/apostilas/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ novoStatus: selectedStatus }),
      })

      if (response.ok) {
        const data = await response.json()
        setApostila(data.data)
        alert('Status atualizado com sucesso!')
      } else {
        const data = await response.json()
        alert(`Erro: ${data.error}`)
      }
    } catch (err) {
      alert('Erro ao atualizar status')
      console.error(err)
    } finally {
      setChangeStatusLoading(false)
    }
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

  const possibleStatuses = STATUS_TRANSITIONS[apostila.status as ApostilaStatus]

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Série</h3>
          <p className="text-lg text-gray-900 dark:text-white">{SERIES[apostila.serie as keyof typeof SERIES].label}</p>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Matéria</h3>
          <p className="text-lg text-gray-900 dark:text-white">{apostila.materia}</p>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</h3>
          <p className="text-lg text-gray-900 dark:text-white">{APOSTILA_STATUS[apostila.status as keyof typeof APOSTILA_STATUS].label}</p>
        </div>
      </div>

      <div className="card mb-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Mudar Status</h2>

        <div className="space-y-4">
          <div>
            <label className="label-base">Novo Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-base"
            >
              <option value={apostila.status}>
                {APOSTILA_STATUS[apostila.status as keyof typeof APOSTILA_STATUS].label} (Atual)
              </option>

              {/* Transições permitidas (forward) */}
              {possibleStatuses.length > 0 && (
                <optgroup label="Próximos status">
                  {possibleStatuses.map((status) => (
                    <option key={status} value={status}>
                      {APOSTILA_STATUS[status as ApostilaStatus].label}
                    </option>
                  ))}
                </optgroup>
              )}

              {/* Reversões (voltar para status anterior) */}
              <optgroup label="Reverter para...">
                {Object.entries(APOSTILA_STATUS).map(([statusKey, statusConfig]) => {
                  const status = statusKey as ApostilaStatus
                  // Mostrar todos os status exceto o atual
                  if (status !== apostila.status) {
                    return (
                      <option key={status} value={status}>
                        {statusConfig.label}
                      </option>
                    )
                  }
                  return null
                })}
              </optgroup>
            </select>
          </div>

          <button
            onClick={handleStatusChange}
            disabled={changeStatusLoading || selectedStatus === apostila.status}
            className="btn-primary"
          >
            {changeStatusLoading ? 'Atualizando...' : 'Atualizar Status'}
          </button>

          {selectedStatus !== apostila.status && (
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
              ⚠️ Você está revertendo o status. Esta ação será registrada no histórico.
            </p>
          )}
        </div>
      </div>

      {apostila.observacoes && (
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Observações</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{apostila.observacoes}</p>
        </div>
      )}

      <div className="card mt-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Informações</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <span className="font-medium">Criado em:</span>{' '}
            {new Date(apostila.criadoEm).toLocaleDateString('pt-BR')}
          </p>
          <p>
            <span className="font-medium">Último update:</span>{' '}
            {new Date(apostila.atualizadoEm).toLocaleDateString('pt-BR')}
          </p>
          {apostila.dataFinal && (
            <p>
              <span className="font-medium">Enviado em:</span>{' '}
              {new Date(apostila.dataFinal).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      </div>

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
        <div className="card mt-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Capítulos Criados ({conteudos.length})</h2>
          <div className="space-y-3">
            {conteudos.map((conteudo) => (
              <ConteudoCard
                key={conteudo.id}
                conteudo={conteudo}
                onEdit={handleEditConteudo}
                onDelete={handleDeleteConteudo}
              />
            ))}
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
