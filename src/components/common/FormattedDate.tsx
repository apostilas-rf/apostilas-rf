'use client'

import { useEffect, useState } from 'react'

interface FormattedDateProps {
  date: string | Date
  format?: 'pt-BR' | 'en-US'
}

export function FormattedDate({ date, format = 'pt-BR' }: FormattedDateProps) {
  const [mounted, setMounted] = useState(false)
  const [formattedDate, setFormattedDate] = useState('')

  useEffect(() => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    setFormattedDate(dateObj.toLocaleDateString(format))
    setMounted(true)
  }, [date, format])

  if (!mounted) {
    return <span>--/--/----</span>
  }

  return <span>{formattedDate}</span>
}
