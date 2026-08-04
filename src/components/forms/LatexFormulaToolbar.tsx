'use client'

import { useState } from 'react'
import { InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'

interface Formula {
  label: string
  latex: string
}

const FORMULAS_BY_CATEGORY: Record<string, Formula[]> = {
  Álgebra: [
    { label: 'Raiz quadrada', latex: '\\sqrt{x}' },
    { label: 'Fração', latex: '\\frac{a}{b}' },
    { label: 'Potência', latex: 'x^{n}' },
    { label: 'Índice', latex: 'x_{i}' },
    { label: 'Raiz n-ésima', latex: '\\sqrt[n]{x}' },
  ],
  Cálculo: [
    { label: 'Limite', latex: '\\lim_{x \\to \\infty}' },
    { label: 'Derivada', latex: '\\frac{df}{dx}' },
    { label: 'Integral indefinida', latex: '\\int f(x) \\, dx' },
    { label: 'Integral definida', latex: '\\int_{a}^{b} f(x) \\, dx' },
    { label: 'Somatória', latex: '\\sum_{i=1}^{n}' },
  ],
  Geometria: [
    { label: 'Ângulo', latex: '\\angle ABC' },
    { label: 'Graus', latex: '\\degree' },
    { label: 'Perpendicular', latex: '\\perp' },
    { label: 'Paralelo', latex: '\\parallel' },
    { label: 'Triângulo', latex: '\\triangle ABC' },
  ],
  Física: [
    { label: 'Velocidade', latex: 'v = \\frac{\\Delta s}{\\Delta t}' },
    { label: 'Aceleração', latex: 'a = \\frac{\\Delta v}{\\Delta t}' },
    { label: 'Força (F=ma)', latex: 'F = m \\cdot a' },
    { label: 'Energia cinética', latex: 'E_c = \\frac{1}{2}mv^2' },
    { label: 'Energia potencial', latex: 'E_p = mgh' },
  ],
  Química: [
    { label: 'Reação química', latex: 'A + B \\rightarrow C + D' },
    { label: 'Mol', latex: 'n = \\frac{m}{M}' },
    { label: 'Concentração', latex: 'C = \\frac{n}{V}' },
    { label: 'pH', latex: 'pH = -\\log[H^+]' },
    { label: 'Equilíbrio', latex: 'K_c = \\frac{[C][D]}{[A][B]}' },
  ],
  Símbolos: [
    { label: 'Aproximadamente igual', latex: '\\approx' },
    { label: 'Infinito', latex: '\\infty' },
    { label: 'Não igual', latex: '\\neq' },
    { label: 'Menor ou igual', latex: '\\leq' },
    { label: 'Maior ou igual', latex: '\\geq' },
    { label: 'Pi', latex: '\\pi' },
    { label: 'Grau', latex: '^\\circ' },
  ],
}

interface TextFormattingButton {
  label: string
  icon: string
  before: string
  after: string
  placeholder?: string
}

const TEXT_FORMATTING: TextFormattingButton[] = [
  {
    label: 'Negrito',
    icon: 'B',
    before: '**',
    after: '**',
    placeholder: 'negrito',
  },
  {
    label: 'Itálico',
    icon: 'I',
    before: '*',
    after: '*',
    placeholder: 'itálico',
  },
  {
    label: 'Código',
    icon: '<>',
    before: '`',
    after: '`',
    placeholder: 'código',
  },
  {
    label: 'Tachado',
    icon: 'S',
    before: '~~',
    after: '~~',
    placeholder: 'tachado',
  },
  {
    label: 'Sublinhado',
    icon: 'U',
    before: '<u>',
    after: '</u>',
    placeholder: 'sublinhado',
  },
]

interface LatexFormulaToolbarProps {
  onInsertFormula: (latex: string) => void
  onApplyFormatting?: (before: string, after: string, placeholder: string) => void
}

export function LatexFormulaToolbar({ onInsertFormula, onApplyFormatting }: LatexFormulaToolbarProps) {
  const [openCategory, setOpenCategory] = useState<string | null>('Álgebra')
  const categories = Object.keys(FORMULAS_BY_CATEGORY)

  const insertTextFormat = (before: string, after: string, placeholder: string) => {
    if (onApplyFormatting) {
      onApplyFormatting(before, after, placeholder)
    } else {
      onInsertFormula(`${before}${placeholder}${after}`)
    }
  }

  return (
    <div className="space-y-3 mb-3">
      {/* Barra de Fórmulas */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        {/* Tabs das categorias */}
        <div className="flex gap-1 flex-wrap mb-3 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setOpenCategory(openCategory === cat ? null : cat)}
              className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                openCategory === cat
                  ? 'bg-rf-green text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Fórmulas da categoria aberta */}
        {openCategory && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {FORMULAS_BY_CATEGORY[openCategory].map((formula) => (
              <button
                key={formula.latex}
                type="button"
                onClick={() => onInsertFormula(` $${formula.latex}$ `)}
                title={formula.label}
                className="p-3 rounded bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 transition-colors text-center flex flex-col items-center justify-center"
              >
                <div className="text-lg mb-1 flex items-center justify-center h-8">
                  <InlineMath>{formula.latex}</InlineMath>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate w-full">{formula.label}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Barra de Formatação de Texto */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 flex gap-1 flex-wrap">
        {TEXT_FORMATTING.map((format) => (
          <button
            key={format.label}
            type="button"
            onClick={() => insertTextFormat(format.before, format.after, format.placeholder || 'texto')}
            title={format.label}
            className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 transition-colors"
          >
            {format.icon}
          </button>
        ))}
      </div>
    </div>
  )
}
