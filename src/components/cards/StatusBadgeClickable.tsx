'use client'

import { useState, useRef, useEffect } from 'react'
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
  const [dropdownAbove, setDropdownAbove] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const config = APOSTILA_STATUS[status]
  const possibleStatuses = STATUS_TRANSITIONS[status]

  useEffect(() => {
    if (open && containerRef.current && dropdownRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const dropdownHeight = dropdownRef.current.offsetHeight
      setDropdownAbove(rect.bottom + dropdownHeight > window.innerHeight - 50)
    }
  }, [open])

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

  const allStatuses = Object.keys(APOSTILA_STATUS) as ApostilaStatus[]

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`${config.bgColor} ${config.color} text-xs font-medium px-3 py-1.5 rounded-full cursor-pointer hover:opacity-80 transition`}
      >
        {config.label}
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className={`absolute left-0 bg-gray-900 dark:bg-gray-800 border border-gray-700 dark:border-gray-600 rounded-lg shadow-xl z-50 min-w-48 ${
            dropdownAbove ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          <div className="py-1 max-h-64 overflow-y-auto">
            {possibleStatuses.map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                disabled={loading}
                className="block w-full text-left px-4 py-2 text-sm text-gray-100 hover:bg-gray-700 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                {APOSTILA_STATUS[st].label}
              </button>
            ))}

            {possibleStatuses.length > 0 && (
              <div className="border-t border-gray-700 dark:border-gray-600 my-1" />
            )}

            <div className="px-4 py-1 text-xs text-gray-400 font-semibold">Outros status</div>
            {allStatuses
              .filter((st) => st !== status && !possibleStatuses.includes(st))
              .map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  disabled={loading}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 transition disabled:opacity-50 opacity-60"
                >
                  {APOSTILA_STATUS[st].label}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
