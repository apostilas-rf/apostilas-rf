'use client'

import { useState } from 'react'
import { APOSTILA_STATUS, STATUS_TRANSITIONS } from '@/lib/constants'
import type { ApostilaStatus } from '@/types'

interface StatusBadgeClickableProps {
  status: ApostilaStatus
  apostilaId: string
  onStatusChange?: (newStatus: ApostilaStatus) => void
}

const TODOS_STATUS = Object.keys(APOSTILA_STATUS) as ApostilaStatus[]

// Select nativo em vez de dropdown próprio: a tabela usa overflow-x-auto, que
// recortava o menu absoluto. O popup do select é desenhado pelo sistema, então
// nunca é cortado nem exige rolar a linha.
export function StatusBadgeClickable({ status, apostilaId, onStatusChange }: StatusBadgeClickableProps) {
  const [loading, setLoading] = useState(false)
  const config = APOSTILA_STATUS[status]

  // Os próximos status do fluxo vêm primeiro; os demais ficam agrupados abaixo
  // para permitir corrigir um status marcado por engano.
  const proximos = STATUS_TRANSITIONS[status]
  const outros = TODOS_STATUS.filter((s) => s !== status && !proximos.includes(s))

  async function handleChange(novoStatus: ApostilaStatus) {
    if (novoStatus === status) return

    setLoading(true)
    try {
      const response = await fetch(`/api/apostilas/${apostilaId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ novoStatus }),
      })

      if (response.ok) {
        onStatusChange?.(novoStatus)
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao atualizar status')
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
      alert('Erro de conexão ao atualizar status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        value={status}
        disabled={loading}
        onChange={(e) => handleChange(e.target.value as ApostilaStatus)}
        aria-label="Mudar status da apostila"
        className={`${config.bgColor} ${config.color} appearance-none text-xs font-medium pl-3 pr-7 py-1.5 rounded-full border-0 cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-rf-green/50 transition disabled:opacity-50`}
      >
        <option value={status} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          {config.label}
        </option>

        {proximos.length > 0 && (
          <optgroup label="Avançar para">
            {proximos.map((s) => (
              <option key={s} value={s} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                {APOSTILA_STATUS[s].label}
              </option>
            ))}
          </optgroup>
        )}

        {outros.length > 0 && (
          <optgroup label="Outros status">
            {outros.map((s) => (
              <option key={s} value={s} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                {APOSTILA_STATUS[s].label}
              </option>
            ))}
          </optgroup>
        )}
      </select>

      <svg
        aria-hidden="true"
        className={`${config.color} pointer-events-none absolute right-2 w-3 h-3`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}
