'use client'

import { useEffect, useState } from 'react'
import { PrazoCard } from '@/components/prazos/PrazoCard'
import { AdicionarPrazoModal } from '@/components/prazos/AdicionarPrazoModal'
import { ETAPAS, ETAPA_LABEL, type Etapa } from '@/lib/etapas'

interface Apostila {
  id: string
  titulo: string
  materia: string
}

interface Prazo {
  id: string
  usuario: { id: string; nome: string; email: string }
  apostila: Apostila
  tarefa: string
  prazoEntrega: string
  statusPrazo: 'NO_PRAZO' | 'VENCIMENTO_PROXIMO' | 'VENCIDO' | 'COMPLETADO'
  concluido: boolean
}

interface PrazoEtapa {
  id: string
  etapa: Etapa
  dataPrazo: string
  concluido: boolean
  statusPrazo: 'NO_PRAZO' | 'VENCIMENTO_PROXIMO' | 'VENCIDO' | 'COMPLETADO'
  responsavel: { id: string; nome: string } | null
  apostila: Apostila
}

const setores = [
  { value: 'DIAGRAMACAO', label: 'Diagramação' },
  { value: 'REVISAO', label: 'Revisão' },
  { value: 'ILUSTRACAO', label: 'Ilustração' },
]

export default function PrazosPage() {
  const [prazos, setPrazos] = useState<Prazo[]>([])
  const [prazosEtapa, setPrazosEtapa] = useState<PrazoEtapa[]>([])
  const [apostilas, setApostilas] = useState<Apostila[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtroEtapa, setFiltroEtapa] = useState<'' | Etapa>('')
  const [filtroStatus, setFiltroStatus] = useState<
    '' | 'NO_PRAZO' | 'VENCIMENTO_PROXIMO' | 'VENCIDO' | 'COMPLETADO'
  >('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [apostilaSelecionada, setApostilaSelecionada] = useState<string>('')

  useEffect(() => {
    buscarPrazos()
    buscarPrazosEtapa()
    buscarApostilas()
  }, [])

  async function buscarPrazosEtapa() {
    try {
      const response = await fetch('/api/deadlines', { credentials: 'include' })
      if (!response.ok) throw new Error('Erro ao buscar prazos por etapa')
      const data = await response.json()
      setPrazosEtapa(data.data || [])
    } catch (err) {
      // A lista por setor continua útil mesmo se esta falhar.
      console.error(err)
    }
  }

  async function buscarPrazos() {
    try {
      setLoading(true)
      const response = await fetch('/api/prazos', { credentials: 'include' })

      if (!response.ok) {
        throw new Error('Erro ao buscar prazos')
      }

      const data = await response.json()
      setPrazos(data.data || [])
      setError('')
    } catch (err) {
      setError('Erro ao carregar prazos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function buscarApostilas() {
    try {
      const response = await fetch('/api/apostilas', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setApostilas(data.data || [])
      }
    } catch (err) {
      console.error('Erro ao buscar apostilas:', err)
    }
  }

  async function handleAdicionarPrazo(prazo: {
    apostilaId: string
    etapa: Etapa
    dataPrazo: string
    responsavelId: string | null
  }) {
    const response = await fetch('/api/deadlines', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prazo),
    })

    if (!response.ok) {
      // Repassa a mensagem da API para o modal em vez de um erro genérico
      const erro = await response.json().catch(() => null)
      throw new Error(erro?.error || 'Erro ao adicionar prazo')
    }

    await buscarPrazosEtapa()
  }

  function getPrazosFiltrads() {
    return prazos.filter((prazo) => {
      if (filtroStatus && prazo.statusPrazo !== filtroStatus) return false
      return true
    })
  }

  const prazosFiltrads = getPrazosFiltrads()

  const etapasFiltradas = prazosEtapa.filter((p) => {
    if (filtroEtapa && p.etapa !== filtroEtapa) return false
    if (filtroStatus && p.statusPrazo !== filtroStatus) return false
    return true
  })

  // Os números passam a contar as etapas, que é o recorte que mostra gargalo.
  const stats = {
    total: prazosEtapa.length,
    noPrazo: prazosEtapa.filter((p) => p.statusPrazo === 'NO_PRAZO').length,
    vencimentoProximo: prazosEtapa.filter((p) => p.statusPrazo === 'VENCIMENTO_PROXIMO')
      .length,
    vencidos: prazosEtapa.filter((p) => p.statusPrazo === 'VENCIDO').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rf-green mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando prazos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              📅 Prazos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie os prazos de confecção das apostilas
            </p>
          </div>
          <button
            onClick={() => setMostrarModal(true)}
            className="px-6 py-2 bg-rf-green text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
          >
            + Adicionar Prazo
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {stats.total}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            No Prazo
          </p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {stats.noPrazo}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Próximo Vencimento
          </p>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
            {stats.vencimentoProximo}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Vencidos</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
            {stats.vencidos}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        <select
          value={filtroEtapa}
          onChange={(e) => setFiltroEtapa(e.target.value as '' | Etapa)}
          aria-label="Filtrar por etapa"
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rf-green"
        >
          <option value="">Todas as etapas</option>
          {ETAPAS.map((e) => (
            <option key={e.valor} value={e.valor}>
              {e.label}
            </option>
          ))}
        </select>

        <select
          value={filtroStatus}
          onChange={(e) => {
            setFiltroStatus(
              e.target.value as
                | ''
                | 'NO_PRAZO'
                | 'VENCIMENTO_PROXIMO'
                | 'VENCIDO'
                | 'COMPLETADO'
            )
          }}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rf-green"
        >
          <option value="">Todos os status</option>
          <option value="NO_PRAZO">No prazo</option>
          <option value="VENCIMENTO_PROXIMO">Vencimento próximo</option>
          <option value="VENCIDO">Vencido</option>
          <option value="COMPLETADO">Completado</option>
        </select>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
          {error}
          <button
            onClick={buscarPrazos}
            className="ml-4 font-medium underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Prazos por etapa — o recorte principal */}
      {etapasFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {etapasFiltradas.map((prazo) => (
            <PrazoCard
              key={prazo.id}
              id={prazo.id}
              titulo={prazo.apostila.titulo}
              descricao={`Etapa: ${ETAPA_LABEL[prazo.etapa]}`}
              responsavel={prazo.responsavel?.nome || 'A definir'}
              prazoEntrega={new Date(prazo.dataPrazo)}
              statusPrazo={prazo.statusPrazo}
              concluido={prazo.concluido}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {prazosEtapa.length === 0
              ? 'Nenhum prazo de etapa definido ainda.'
              : 'Nenhum prazo com os filtros selecionados.'}
          </p>
          {prazosEtapa.length === 0 && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Use “Adicionar Prazo” acima, ou defina as quatro etapas dentro da apostila.
            </p>
          )}
        </div>
      )}

      {/* Atribuições por setor: modelo antigo, mantido para não sumir com o que
          já foi cadastrado. Sai quando as etapas cobrirem tudo. */}
      {prazosFiltrads.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
            Atribuições por setor
          </h2>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Cadastradas antes dos prazos por etapa.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prazosFiltrads.map((prazo) => (
              <PrazoCard
                key={prazo.id}
                id={prazo.id}
                titulo={prazo.apostila.titulo}
                descricao={`Setor: ${setores.find((s) => s.value === prazo.tarefa)?.label || 'N/A'}`}
                responsavel={prazo.usuario.nome}
                prazoEntrega={prazo.prazoEntrega ? new Date(prazo.prazoEntrega) : null}
                statusPrazo={prazo.statusPrazo}
                concluido={prazo.concluido}
              />
            ))}
          </div>
        </section>
      )}

      {mostrarModal && (
        <AdicionarPrazoModal
          apostilaId={apostilaSelecionada}
          apostilas={apostilas}
          onAdicionar={handleAdicionarPrazo}
          onFechar={() => {
            setMostrarModal(false)
            setApostilaSelecionada('')
          }}
          onApostilaChange={setApostilaSelecionada}
        />
      )}
    </div>
  )
}
