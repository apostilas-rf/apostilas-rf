import { APOSTILA_STATUS } from '@/lib/constants'
import type { ApostilaStatus } from '@/types'

interface StatusBadgeProps {
  status: ApostilaStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = APOSTILA_STATUS[status]

  if (!config) {
    return null
  }

  return (
    <span
      className={`badge ${config.bgColor} ${config.color} text-xs font-medium px-3 py-1 rounded-full ${className}`}
    >
      {config.label}
    </span>
  )
}
