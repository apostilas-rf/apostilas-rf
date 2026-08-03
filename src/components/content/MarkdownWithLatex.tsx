'use client'

import { useMemo } from 'react'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

interface MarkdownWithLatexProps {
  content: string
  className?: string
}

/**
 * Renderiza conteúdo Markdown com suporte a LaTeX.
 *
 * Sintaxe:
 * - $fórmula$ → fórmula inline
 * - $$fórmula$$ → fórmula em bloco
 * - ![desc](url) → imagem
 * - **negrito**, *itálico*, etc → formatação básica
 */
export function MarkdownWithLatex({ content, className = '' }: MarkdownWithLatexProps) {
  const parsed = useMemo(() => {
    const parts: React.ReactNode[] = []
    let lastIndex = 0

    // Regex para encontrar LaTeX: $$...$$ ou $...$
    // Procura primeiro por $$ para evitar conflito com $ simples
    const regex = /(\$\$[^$]*\$\$|\$[^$]*\$|!\[([^\]]*)\]\(([^)]*)\)|!\n)/g
    let match

    while ((match = regex.exec(content)) !== null) {
      // Adicionar texto antes da match
      if (match.index > lastIndex) {
        const text = content.slice(lastIndex, match.index)
        if (text) {
          parts.push(
            <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
              {renderMarkdown(text)}
            </span>
          )
        }
      }

      // Processar a match
      if (match[0].startsWith('$$')) {
        // Fórmula em bloco
        const formula = match[0].slice(2, -2)
        parts.push(
          <div key={`block-${match.index}`} className="my-2 overflow-x-auto">
            <BlockMath>{formula}</BlockMath>
          </div>
        )
      } else if (match[0].startsWith('$') && match[0].endsWith('$')) {
        // Fórmula inline
        const formula = match[0].slice(1, -1)
        parts.push(
          <InlineMath key={`inline-${match.index}`}>{formula}</InlineMath>
        )
      } else if (match[0].startsWith('![')) {
        // Imagem markdown
        const alt = match[2] || ''
        const src = match[3] || ''
        parts.push(
          <img
            key={`img-${match.index}`}
            src={src}
            alt={alt}
            className="max-w-full h-auto rounded-lg my-2"
          />
        )
      }

      lastIndex = match.index + match[0].length
    }

    // Adicionar resto do conteúdo
    if (lastIndex < content.length) {
      const text = content.slice(lastIndex)
      if (text) {
        parts.push(
          <span key={`text-final`} className="whitespace-pre-wrap">
            {renderMarkdown(text)}
          </span>
        )
      }
    }

    return parts
  }, [content])

  return <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>{parsed}</div>
}

/**
 * Renderiza Markdown básico (negrito, itálico, códigos).
 * Não renderiza LaTeX nem imagens — esses são tratados pelo componente pai.
 */
function renderMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let lastIndex = 0

  // Regex para negrito, itálico, código inline
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g
  let match

  while ((match = regex.exec(text)) !== null) {
    // Texto antes da match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    // Processar a match
    if (match[0].startsWith('**')) {
      parts.push(
        <strong key={`bold-${match.index}`}>{match[0].slice(2, -2)}</strong>
      )
    } else if (match[0].startsWith('*')) {
      parts.push(<em key={`italic-${match.index}`}>{match[0].slice(1, -1)}</em>)
    } else if (match[0].startsWith('`')) {
      parts.push(
        <code
          key={`code-${match.index}`}
          className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono"
        >
          {match[0].slice(1, -1)}
        </code>
      )
    }

    lastIndex = match.index + match[0].length
  }

  // Resto do texto
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}
