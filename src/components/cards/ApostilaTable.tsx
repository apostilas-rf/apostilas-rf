'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { StatusBadgeClickable } from './StatusBadgeClickable'
import { VisualizarApostilaModal } from './VisualizarApostilaModal'
import { PrazosMiniPreview } from '@/components/prazos/PrazosMiniPreview'
import { SERIES } from '@/lib/constants'
import type { Apostila, ApostilaStatus } from '@/types'

interface ApostilaTableProps {
  apostilas: Apostila[]
  isLoading?: boolean
  onDelete?: (id: string) => void
  onStatusChange?: (id: string, status: ApostilaStatus) => void
}

export function ApostilaTable({ apostilas, isLoading = false, onDelete, onStatusChange }: ApostilaTableProps) {
  const [apostasList, setApostasList] = useState(apostilas)
  const [visualizando, setVisualizando] = useState<Apostila | null>(null)

  useEffect(() => {
    setApostasList(apostilas)
  }, [apostilas])
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    )
  }

  if (apostilas.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400">Nenhuma apostila encontrada</div>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
        <thead>
          {/* Cabeçalho sem fundo próprio nem borda dura: o rótulo miúdo em
              maiúsculas já separa da primeira linha. */}
          <tr style={{ borderColor: 'var(--line)' }} className="border-b">
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Título</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Matéria</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Série</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Status</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Criado em</th>
            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Ações</th>
          </tr>
        </thead>
        <tbody>
          {apostasList.map((apostila) => [
            <tr
              key={apostila.id}
              style={{ borderColor: 'var(--line)' }}
              className="table-row-hover border-b last:border-0"
            >
              <td className="px-6 py-4">
                <Link
                  href={`/dashboard/apostilas/${apostila.id}`}
                  className="font-medium text-gray-900 hover:text-rf-green dark:text-white"
                >
                  {apostila.titulo}
                </Link>
              </td>
              <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{apostila.materia}</td>
              <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                {SERIES[apostila.serie].label}
              </td>
              <td className="px-6 py-4">
                <StatusBadgeClickable
                  status={apostila.status}
                  apostilaId={apostila.id}
                  onStatusChange={(newStatus) => {
                    setApostasList((prev) =>
                      prev.map((a) => (a.id === apostila.id ? { ...a, status: newStatus } : a))
                    )
                    onStatusChange?.(apostila.id, newStatus)
                  }}
                />
              </td>
              <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                {new Date(apostila.criadoEm).toLocaleDateString('pt-BR')}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => setVisualizando(apostila)}
                    title="Visualizar conteúdo"
                    aria-label={`Visualizar ${apostila.titulo}`}
                    className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-500/10 hover:text-rf-green dark:text-gray-400 dark:hover:bg-white/5"
                  >
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <Link
                    href={`/dashboard/apostilas/${apostila.id}`}
                    className="rounded-xl px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-500/10 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
                  >
                    Editar
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Tem certeza que deseja excluir "${apostila.titulo}"?`)) {
                          onDelete(apostila.id)
                        }
                      }}
                      className="rounded-xl px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-500/10 dark:text-red-400"
                    >
                      Excluir
                    </button>
                  )}
                </div>
              </td>
            </tr>,
            <tr
              key={`prazos-${apostila.id}`}
              style={{ borderColor: 'var(--line)' }}
              className="border-b last:border-0 bg-gray-500/5 dark:bg-white/5"
            >
              <td colSpan={6} className="px-6 py-3">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Prazos por etapa</div>
                <PrazosMiniPreview apostilaId={apostila.id} />
              </td>
            </tr>,
          ])}
          </tbody>
        </table>
      </div>

      {/* Fora do contêiner rolável de propósito: um transform num ancestral
          faria o fixed virar posicionamento relativo a ele e o modal sumiria. */}
      {visualizando && (
        <VisualizarApostilaModal
          apostilaId={visualizando.id}
          titulo={visualizando.titulo}
          onClose={() => setVisualizando(null)}
        />
      )}
    </>
  )
}
