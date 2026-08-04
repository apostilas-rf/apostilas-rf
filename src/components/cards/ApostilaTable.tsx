'use client'

import Link from 'next/link'
import { useState } from 'react'
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
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-rf-green">Título</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-rf-green">Matéria</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-rf-green">Série</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-rf-green">Status</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-rf-green">Criado em</th>
            <th className="px-6 py-3 text-center font-semibold text-gray-700 dark:text-rf-green">Ações</th>
          </tr>
        </thead>
        <tbody>
          {apostasList.map((apostila) => (
            <tr key={apostila.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="px-6 py-4">
                <Link
                  href={`/dashboard/apostilas/${apostila.id}`}
                  className="text-rf-green font-medium hover:underline"
                >
                  {apostila.titulo}
                </Link>
              </td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{apostila.materia}</td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
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
              <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs">
                {new Date(apostila.criadoEm).toLocaleDateString('pt-BR')}
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex gap-3 justify-center">
                  <Link
                    href={`/dashboard/apostilas/${apostila.id}`}
                    className="text-rf-green hover:underline text-xs font-medium"
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
                      className="text-red-600 hover:underline text-xs font-medium"
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
