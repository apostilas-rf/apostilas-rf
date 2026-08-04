'use client'

import { useState } from 'react'
import { APOSTILA_STATUS, STATUS_TRANSITIONS } from '@/lib/constants'
import type { ApostilaStatus } from '@/types'

interface StatusBadgeClickableProps {
  status: ApostilaStatus
  apostilaId: string
  onStatusChange?: (newStatus: ApostilaStatus) => void
}

export function StatusBadgeClickable({ status, apostilaId, onStatusChange }: StatusBadgeClickableProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const config = APOSTILA_STATUS[status]
  const possibleStatuses = STATUS_TRANSITIONS[status]

  async function handleStatusChange(newStatus: ApostilaStatus) {
    setLoading(true)
    try {
      const response = await fetch(`/api/apostilas/${apostilaId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ novoStatus: newStatus }),
      })

      if (response.ok) {
        onStatusChange?.(newStatus)
        setOpen(false)
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={`badge ${config.bgColor} ${config.color} text-xs font-medium px-3 py-1 rounded-full cursor-pointer hover:opacity-90 transition`}
      >
        {config.label}
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-max">
          <div className="py-1">
            {possibleStatuses.length > 0 && (
              <>
                {possibleStatuses.map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    disabled={loading}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
                  >
                    {APOSTILA_STATUS[st].label}
                  </button>
                ))}
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              </>
            )}

            <button
              onClick={() => setOpen(false)}
              className="block w-full text-left px-4 py-2 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
