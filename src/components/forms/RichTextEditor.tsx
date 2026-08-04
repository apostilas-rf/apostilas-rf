'use client'

import { useRef, forwardRef } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  maxLength?: number
}

export const RichTextEditor = forwardRef<HTMLTextAreaElement, RichTextEditorProps>(
  function RichTextEditor(
    {
      value,
      onChange,
      onPaste,
      placeholder = 'Escreva aqui...',
      maxLength = 30000,
    },
    ref
  ) {
    const defaultRef = useRef<HTMLTextAreaElement>(null)
    const textareaRef = ref || defaultRef

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxLength) {
      onChange(e.target.value)
    }
  }

  return (
    <div className="w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onPaste={onPaste}
        placeholder={placeholder}
        rows={14}
        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rf-green font-sans text-sm dark:bg-gray-800 dark:text-white resize-none"
        style={{ fontFamily: 'Open Sans, system-ui, sans-serif' }}
        maxLength={maxLength}
        required
      />
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        {value.length} / {maxLength} caracteres
      </p>
    </div>
  )
}
)
