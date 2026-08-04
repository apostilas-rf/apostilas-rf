'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { StatusBadgeClickable } from './StatusBadgeClickable'
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
          {apostasList.map((apostila) => (
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
                <div className="flex justify-center gap-2">
                  <Link
                    href={`/dashboard/apostilas/${apostila.id}`}
                    className="rounded-xl px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-500/10 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
                  >
                    Ver
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
