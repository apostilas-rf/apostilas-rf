'use client'

import { useMemo, useState } from 'react'
import { InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import { CampoFormula } from './CampoFormula'

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

const CATEGORIAS = Object.keys(FORMULAS_BY_CATEGORY)

const TODAS: (Formula & { categoria: string })[] = CATEGORIAS.flatMap((categoria) =>
  FORMULAS_BY_CATEGORY[categoria].map((f) => ({ ...f, categoria }))
)

interface TextFormattingButton {
  label: string
  icon: string
  before: string
  after: string
  placeholder?: string
}

const TEXT_FORMATTING: TextFormattingButton[] = [
  { label: 'Negrito', icon: 'B', before: '**', after: '**', placeholder: 'negrito' },
  { label: 'Itálico', icon: 'I', before: '*', after: '*', placeholder: 'itálico' },
  { label: 'Código', icon: '<>', before: '`', after: '`', placeholder: 'código' },
  { label: 'Tachado', icon: 'S', before: '~~', after: '~~', placeholder: 'tachado' },
  { label: 'Sublinhado', icon: 'U', before: '<u>', after: '</u>', placeholder: 'sublinhado' },
]

// Sem acento e em minúsculas, para "calculo" achar "Cálculo".
function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

interface LatexFormulaToolbarProps {
  onInsertFormula: (latex: string) => void
  onApplyFormatting?: (before: string, after: string, placeholder: string) => void
}

export function LatexFormulaToolbar({
  onInsertFormula,
  onApplyFormatting,
}: LatexFormulaToolbarProps) {
  const [categoria, setCategoria] = useState<string>('Álgebra')
  const [busca, setBusca] = useState('')
  const [painel, setPainel] = useState<'nenhum' | 'prontas' | 'escrever'>('nenhum')
  const [formulaLivre, setFormulaLivre] = useState('')

  const buscando = busca.trim().length > 0

  const visiveis = useMemo(() => {
    if (!buscando) return FORMULAS_BY_CATEGORY[categoria]
    const alvo = normalizar(busca)
    return TODAS.filter(
      (f) => normalizar(f.label).includes(alvo) || normalizar(f.categoria).includes(alvo)
    )
  }, [busca, buscando, categoria])

  const inserirTexto = (before: string, after: string, placeholder: string) => {
    if (onApplyFormatting) onApplyFormatting(before, after, placeholder)
    else onInsertFormula(`${before}${placeholder}${after}`)
  }

  const confirmarFormulaLivre = () => {
    const latex = formulaLivre.trim()
    if (!latex) return
    onInsertFormula(latex)
    setFormulaLivre('')
    setPainel('nenhum')
  }

  const alternar = (alvo: 'prontas' | 'escrever') =>
    setPainel((atual) => (atual === alvo ? 'nenhum' : alvo))

  return (
    <div className="space-y-2">
      {/* Uma faixa só: formatação de texto e as duas entradas de fórmula.
          Antes a grade de fórmulas ficava sempre aberta e comia 300px de
          altura antes de o professor chegar no campo de escrever. */}
      <div className="flex flex-wrap items-center gap-1.5">
        {TEXT_FORMATTING.map((format) => (
          <button
            key={format.label}
            type="button"
            onClick={() => inserirTexto(format.before, format.after, format.placeholder || 'texto')}
            title={format.label}
            aria-label={format.label}
            className="h-9 w-9 rounded-xl bg-gray-500/10 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-500/20 dark:text-gray-200 dark:bg-white/5 dark:hover:bg-white/10"
          >
            {format.icon}
          </button>
        ))}

        <span className="mx-1 h-6 w-px" style={{ backgroundColor: 'var(--line-strong)' }} />

        <button
          type="button"
          onClick={() => alternar('escrever')}
          aria-expanded={painel === 'escrever'}
          className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors ${
            painel === 'escrever'
              ? 'bg-rf-green text-white'
              : 'bg-rf-green/10 text-rf-green hover:bg-rf-green/20'
          }`}
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 4h9M7 20c2 0 3-1 3-3V6M4 12h7M15 11l6 6M21 11l-6 6" />
          </svg>
          Escrever fórmula
        </button>

        <button
          type="button"
          onClick={() => alternar('prontas')}
          aria-expanded={painel === 'prontas'}
          className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors ${
            painel === 'prontas'
              ? 'bg-gray-500/20 text-gray-900 dark:bg-white/10 dark:text-white'
              : 'bg-gray-500/10 text-gray-700 hover:bg-gray-500/20 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10'
          }`}
        >
          Fórmulas prontas
        </button>
      </div>

      {painel === 'escrever' && (
        <div className="space-y-2">
          <CampoFormula
            valor={formulaLivre}
            onChange={setFormulaLivre}
            onEnter={confirmarFormulaLivre}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={confirmarFormulaLivre}
              disabled={!formulaLivre.trim()}
              className="btn-soft btn-soft-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Inserir no texto
            </button>
            <button
              type="button"
              onClick={() => {
                setFormulaLivre('')
                setPainel('nenhum')
              }}
              className="btn-soft bg-gray-500/10 text-gray-700 hover:bg-gray-500/20 dark:bg-white/5 dark:text-gray-200"
            >
              Cancelar
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Digite normalmente: <code>/</code> vira fração, <code>^</code> expoente. O teclado de
              símbolos abre no ícone do canto do campo.
            </span>
          </div>
        </div>
      )}

      {painel === 'prontas' && (
        <div className="card-inset space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar fórmula…"
              aria-label="Buscar fórmula"
              className="h-8 min-w-[10rem] flex-1 rounded-xl bg-[var(--surface)] px-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rf-green/25 dark:text-gray-100"
              style={{ border: '1px solid var(--line-strong)' }}
            />
            {!buscando &&
              CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoria(cat)}
                  aria-pressed={categoria === cat}
                  className={`h-8 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium transition-colors ${
                    categoria === cat
                      ? 'bg-rf-green text-white'
                      : 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20 dark:bg-white/5 dark:text-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
          </div>

          {visiveis.length === 0 ? (
            <p className="py-2 text-sm text-gray-500 dark:text-gray-400">
              Nenhuma fórmula encontrada. Use <strong>Escrever fórmula</strong> para montar a sua.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {visiveis.map((formula) => (
                <button
                  key={formula.latex}
                  type="button"
                  onClick={() => onInsertFormula(formula.latex)}
                  title={formula.label}
                  aria-label={formula.label}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--surface)] px-3 text-gray-800 transition-colors hover:bg-rf-green/10 hover:text-rf-green dark:text-gray-100"
                  style={{ border: '1px solid var(--line)' }}
                >
                  <InlineMath>{formula.latex}</InlineMath>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formula.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
