'use client'

import { useEffect, useState } from 'react'
import { diasAte, statusDaEtapa, ETAPA_LABEL, type Etapa } from '@/lib/etapas'

interface Deadline {
  id: string
  etapa: string
  dataPrazo: string
  concluido: boolean
}

interface PrazosMiniPreviewProps {
  apostilaId: string
}

export function PrazosMiniPreview({ apostilaId }: PrazosMiniPreviewProps) {
  const [prazos, setPrazos] = useState<Deadline[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let cancelado = false
    fetch(`/api/deadlines?apostilaId=${apostilaId}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('falha'))))
      .then((d) => {
        if (!cancelado) setPrazos(d.data || [])
      })
      .catch(() => {
        if (!cancelado) setPrazos([])
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })
    return () => {
      cancelado = true
    }
  }, [apostilaId])

  if (carregando) return null

  if (prazos.length === 0) {
    return <span className="text-xs text-gray-500 dark:text-gray-400">Sem prazos definidos</span>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {prazos.map((prazo) => {
        const dias = diasAte(prazo.dataPrazo)
        const status = statusDaEtapa(prazo.dataPrazo, prazo.concluido)
        const etapa = ETAPA_LABEL[prazo.etapa as Etapa] || prazo.etapa
        const dataFormatada = prazo.dataPrazo
          ? new Date(prazo.dataPrazo).toLocaleDateString('pt-BR', {
              month: '2-digit',
              day: '2-digit',
            })
          : '—'

        let bgColor = 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
        let borderColor = 'border-gray-500/30'

        if (!prazo.dataPrazo) {
          bgColor = 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
          borderColor = 'border-gray-500/30'
        } else if (status === 'COMPLETADO') {
          bgColor = 'bg-green-500/10 text-green-600 dark:text-green-400'
          borderColor = 'border-green-500/30'
        } else if (status === 'VENCIDO') {
          bgColor = 'bg-red-500/10 text-red-600 dark:text-red-400'
          borderColor = 'border-red-500/30'
        } else if (status === 'VENCIMENTO_PROXIMO') {
          bgColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          borderColor = 'border-amber-500/30'
        }

        return (
          <div
            key={prazo.id}
            className={`px-2 py-1 rounded text-xs font-medium border ${bgColor} ${borderColor}`}
          >
            <span className="block leading-none">{etapa.slice(0, 5)}</span>
            <span className="text-xs opacity-75">{dataFormatada}</span>
          </div>
        )
      })}
    </div>
  )
}
