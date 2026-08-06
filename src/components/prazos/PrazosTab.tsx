'use client'

import { useEffect, useState } from 'react'
import { PrazoCard } from './PrazoCard'

interface PrazoInfo {
  id: string
  apostila: { id: string; titulo: string; materia: string }
  usuario: { nome: string }
  prazoEntrega: string | null
  statusPrazo: 'NO_PRAZO' | 'VENCIMENTO_PROXIMO' | 'VENCIDO' | 'COMPLETADO'
  concluido: boolean
}

interface PrazosTabProps {
  setorId: string
  setorLabel: string
}

export function PrazosTab({ setorId, setorLabel }: PrazosTabProps) {
  const [prazos, setPrazos] = useState<PrazoInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    buscarPrazos()
  }, [setorId])

  async function buscarPrazos() {
    try {
      setLoading(true)
      const response = await fetch(`/api/prazos?setor=${setorId}`, {
        credentials: 'include',
      })

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rf-green mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando prazos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
        {error}
        <button
          onClick={buscarPrazos}
          className="ml-4 font-medium underline hover:no-underline"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (prazos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          Nenhum prazo definido para {setorLabel.toLowerCase()} ainda.
        </p>
      </div>
    )
  }

  const stats = {
    total: prazos.length,
    noPrazo: prazos.filter((p) => p.statusPrazo === 'NO_PRAZO').length,
    vencimentoProximo: prazos.filter((p) => p.statusPrazo === 'VENCIMENTO_PROXIMO')
      .length,
    vencidos: prazos.filter((p) => p.statusPrazo === 'VENCIDO').length,
  }

  return (
    <div>
      {/* Mini Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </p>
        </div>
        <div className="p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">No Prazo</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {stats.noPrazo}
          </p>
        </div>
        <div className="p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Próx. Vencimento
          </p>
          <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.vencimentoProximo}
          </p>
        </div>
        <div className="p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">Vencidos</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">
            {stats.vencidos}
          </p>
        </div>
      </div>

      {/* Lista de Prazos */}
      <div className="space-y-3">
        {prazos.map((prazo) => (
          <PrazoCard
            key={prazo.id}
            id={prazo.id}
            titulo={prazo.apostila.titulo}
            descricao={prazo.apostila.materia}
            responsavel={prazo.usuario.nome}
            prazoEntrega={prazo.prazoEntrega ? new Date(prazo.prazoEntrega) : null}
            statusPrazo={prazo.statusPrazo}
            concluido={prazo.concluido}
          />
        ))}
      </div>
    </div>
  )
}
