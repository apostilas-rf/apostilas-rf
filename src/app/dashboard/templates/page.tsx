'use client'

import { useEffect, useState } from 'react'
import { TemplateCard } from '@/components/templates/TemplateCard'
import { CreateTemplateModal } from '@/components/templates/CreateTemplateModal'
import { EditTemplateModal } from '@/components/templates/EditTemplateModal'

interface Template {
  id: string
  titulo: string
  serie: 'PRIMEIRO_ANO' | 'SEGUNDO_ANO' | 'TERCEIRO_ANO' | 'CURSINHO'
  descricao?: string
  estrutura: any
  criadoEm: Date
  atualizadoEm: Date
  _count?: {
    apostilas: number
  }
}

const serieLabels: Record<string, string> = {
  PRIMEIRO_ANO: '1º Ano',
  SEGUNDO_ANO: '2º Ano',
  TERCEIRO_ANO: '3º Ano',
  CURSINHO: 'Cursinho',
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [filtroSerie, setFiltroSerie] = useState<'TODOS' | 'PRIMEIRO_ANO' | 'SEGUNDO_ANO' | 'TERCEIRO_ANO' | 'CURSINHO'>('TODOS')
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [arrastandoId, setArrastandoId] = useState<string | null>(null)
  const [erroOrdem, setErroOrdem] = useState('')

  // Reordena a lista completa movendo um card para a posicao de outro.
  // A troca acontece na lista inteira, e nao apenas no subconjunto
  // filtrado, para a ordem salva continuar coerente com todos os filtros.
  function moverTemplate(idArrastado: string, idAlvo: string) {
    if (idArrastado === idAlvo) return

    setTemplates((atuais) => {
      const de = atuais.findIndex((t) => t.id === idArrastado)
      const para = atuais.findIndex((t) => t.id === idAlvo)
      if (de === -1 || para === -1) return atuais

      const nova = [...atuais]
      const [movido] = nova.splice(de, 1)
      nova.splice(para, 0, movido)

      salvarOrdem(nova.map((t) => t.id), atuais)
      return nova
    })
  }

  async function salvarOrdem(ids: string[], anterior: Template[]) {
    setErroOrdem('')
    try {
      const response = await fetch('/api/templates/ordem', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })

      if (!response.ok) {
        const erro = await response.json().catch(() => null)
        throw new Error(erro?.error || 'Erro ao salvar a ordem')
      }
    } catch (err) {
      // Volta ao estado anterior para a tela nao mostrar uma ordem
      // que o banco nao tem
      setTemplates(anterior)
      setErroOrdem(err instanceof Error ? err.message : 'Erro ao salvar a ordem')
    }
  }

  useEffect(() => {
    fetchUser()
    fetchTemplates()
  }, [])

  async function fetchUser() {
    try {
      setUserLoading(true)
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setUserRole(data.data.role)
      }
    } catch (err) {
      console.error('Erro ao buscar usuário:', err)
    } finally {
      setUserLoading(false)
    }
  }

  async function fetchTemplates() {
    try {
      setLoading(true)
      const response = await fetch('/api/templates', {
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Erro ao buscar templates')

      const data = await response.json()
      setTemplates(data.data || [])
      setError('')
    } catch (err) {
      setError('Erro ao carregar templates')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function getTemplatesFiltrados() {
    if (filtroSerie === 'TODOS') return templates
    return templates.filter((t) => t.serie === filtroSerie)
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Tem certeza que deseja excluir este template?')) return

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Erro ao excluir')

      setTemplates(templates.filter((t) => t.id !== id))
      alert('Template excluído com sucesso!')
    } catch (err) {
      alert('Erro ao excluir template')
      console.error(err)
    }
  }

  const filtrados = getTemplatesFiltrados()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rf-green mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📋 Templates</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {userRole === 'GESTOR'
              ? 'Gerencie templates de estrutura das apostilas'
              : 'Visualize templates de estrutura das apostilas'}
          </p>
        </div>
        {userRole === 'GESTOR' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            + Novo Template
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 rounded">
          {error}
          <button
            onClick={fetchTemplates}
            className="ml-4 font-medium underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="card dark:bg-gray-800/50 dark:border-gray-700 mb-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-rf-green mb-4">Filtros</h2>
        <div className="flex gap-2 flex-wrap">
          {(['TODOS', 'PRIMEIRO_ANO', 'SEGUNDO_ANO', 'TERCEIRO_ANO', 'CURSINHO'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltroSerie(f)}
              className={`px-4 py-2 rounded font-medium ${
                filtroSerie === f
                  ? 'bg-rf-green text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {f === 'TODOS' ? 'Todas as Séries' : serieLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total de Templates</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{templates.length}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Atribuídos</p>
          <p className="text-3xl font-bold text-rf-green mt-2">
            {templates.filter((t) => (t._count?.apostilas || 0) > 0).length}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Não Atribuídos</p>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
            {templates.filter((t) => (t._count?.apostilas || 0) === 0).length}
          </p>
        </div>
      </div>

      {erroOrdem && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {erroOrdem} — a ordem anterior foi restaurada.
        </div>
      )}

      {/* Lista de Templates */}
      {filtrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((template) => (
            <div
              key={template.id}
              draggable={userRole === 'GESTOR'}
              onDragStart={(e) => {
                setArrastandoId(template.id)
                e.dataTransfer.effectAllowed = 'move'
                // Firefox so inicia o arrasto se algo for definido aqui
                e.dataTransfer.setData('text/plain', template.id)
              }}
              onDragOver={(e) => {
                if (!arrastandoId) return
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
              }}
              onDrop={(e) => {
                e.preventDefault()
                const origem = arrastandoId || e.dataTransfer.getData('text/plain')
                if (origem) moverTemplate(origem, template.id)
                setArrastandoId(null)
              }}
              onDragEnd={() => setArrastandoId(null)}
              className={`transition-opacity ${
                userRole === 'GESTOR' ? 'cursor-grab active:cursor-grabbing' : ''
              } ${arrastandoId === template.id ? 'opacity-40' : ''}`}
            >
              <TemplateCard
                template={template}
                serieLabel={serieLabels[template.serie]}
                onEdit={setEditingTemplate}
                onDelete={handleDelete}
                isGestor={userRole === 'GESTOR'}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-lg">Nenhum template encontrado</p>
        </div>
      )}

      {/* Modais */}
      {userRole === 'GESTOR' && showCreateModal && (
        <CreateTemplateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchTemplates()
          }}
        />
      )}

      {userRole === 'GESTOR' && editingTemplate && (
        <EditTemplateModal
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSuccess={() => {
            setEditingTemplate(null)
            fetchTemplates()
          }}
        />
      )}
    </div>
  )
}
