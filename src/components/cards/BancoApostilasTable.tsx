'use client'

import { useState, useEffect } from 'react'
import { SERIES } from '@/lib/constants'
import type { Apostila } from '@/types'

interface BancoApostilasTableProps {
  apostilas: Apostila[]
  isLoading?: boolean
}

export function BancoApostilasTable({ apostilas, isLoading = false }: BancoApostilasTableProps) {
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
        <div className="text-gray-500 dark:text-gray-400">Nenhuma apostila finalizada</div>
      </div>
    )
  }

  async function handleDownload(apostila: Apostila) {
    try {
      const response = await fetch(`/api/apostilas/${apostila.id}/export`, {
        credentials: 'include',
      })

      if (!response.ok) {
        alert('Erro ao baixar apostila')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${apostila.titulo.replace(/\s+/g, '_')}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao baixar:', error)
      alert('Erro ao baixar apostila')
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderColor: 'var(--line)' }} className="border-b">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Matéria
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Série
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Finalizado em
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Ações
              </th>
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
                  <span className="font-medium text-gray-900 dark:text-white">{apostila.titulo}</span>
                </td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{apostila.materia}</td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                  {SERIES[apostila.serie]?.label || apostila.serie}
                </td>
                <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                  {apostila.atualizadoEm
                    ? new Date(apostila.atualizadoEm).toLocaleDateString('pt-BR')
                    : '—'}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDownload(apostila)}
                    title="Baixar texto como arquivo .txt"
                    aria-label={`Baixar ${apostila.titulo}`}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-500/10 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white transition-colors"
                  >
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Baixar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
