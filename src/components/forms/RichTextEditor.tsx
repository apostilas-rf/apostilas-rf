'use client'

import { useRef, useEffect, useState } from 'react'
import { MarkdownWithLatex } from '@/components/content/MarkdownWithLatex'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  onPaste: (e: React.ClipboardEvent<HTMLDivElement>) => void
  placeholder?: string
  maxLength?: number
}

export function RichTextEditor({
  value,
  onChange,
  onPaste,
  placeholder = 'Escreva aqui...',
  maxLength = 30000,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const syncRef = useRef<boolean>(false)

  useEffect(() => {
    if (editorRef.current && !syncRef.current) {
      editorRef.current.textContent = value
      syncRef.current = false
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      const newValue = editorRef.current.textContent || ''
      if (newValue.length <= maxLength) {
        syncRef.current = true
        onChange(newValue)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (editorRef.current && editorRef.current.textContent) {
      const length = editorRef.current.textContent.length
      if (length >= maxLength && e.key !== 'Backspace' && e.key !== 'Delete') {
        e.preventDefault()
      }
    }
  }

  return (
    <div className="relative w-full">
      {/* Renderização (fundo) */}
      <div
        className="absolute inset-0 p-3 pointer-events-none overflow-hidden text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap break-words"
        style={{ fontFamily: 'Open Sans, system-ui, sans-serif' }}
      >
        <MarkdownWithLatex content={value} />
      </div>

      {/* Input (frente - com texto transparente) */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={onPaste}
        className="relative z-10 w-full min-h-56 p-3 border-0 resize-none focus:outline-none focus:ring-0 font-sans text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words"
        style={{
          fontFamily: 'Open Sans, system-ui, sans-serif',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
        }}
        data-placeholder={placeholder}
        onFocus={(e) => {
          if (e.currentTarget.textContent === '' && e.currentTarget.dataset.placeholder) {
            e.currentTarget.textContent = ''
          }
        }}
      />

      {/* Contador de caracteres */}
      <div className="relative z-20 mt-2 text-xs text-gray-500 dark:text-gray-400">
        {value.length} / {maxLength} caracteres
      </div>
    </div>
  )
}
