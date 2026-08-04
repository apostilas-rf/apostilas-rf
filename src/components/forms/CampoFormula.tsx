'use client'

import { useEffect, useRef, useState } from 'react'

// O <math-field> é um custom element: só existe depois que o mathlive roda no
// navegador. Importar no topo quebra o build (window/document no servidor),
// por isso o import fica dentro do efeito.
interface CampoFormulaProps {
  valor: string
  onChange: (latex: string) => void
  onEnter?: () => void
}

export function CampoFormula({ valor, onChange, onEnter }: CampoFormulaProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const campoRef = useRef<any>(null)
  const [pronto, setPronto] = useState(false)

  // Guarda o onChange mais recente sem recriar o campo a cada render — recriar
  // faria o cursor pular para o fim a cada tecla.
  const onChangeRef = useRef(onChange)
  const onEnterRef = useRef(onEnter)
  onChangeRef.current = onChange
  onEnterRef.current = onEnter

  useEffect(() => {
    let vivo = true

    import('mathlive').then(({ MathfieldElement }) => {
      if (!vivo || !hostRef.current) return

      // Fontes e sons servidos de public/. Sem isto o mathlive procura os
      // arquivos ao lado do bundle e o console enche de 404.
      MathfieldElement.fontsDirectory = '/mathlive/fonts'
      MathfieldElement.soundsDirectory = null

      const campo = new MathfieldElement()
      campo.value = valor
      campo.style.width = '100%'
      campo.style.minHeight = '3.5rem'
      campo.style.fontSize = '1.25rem'

      campo.addEventListener('input', () => {
        onChangeRef.current(campo.value)
      })

      campo.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          onEnterRef.current?.()
        }
      })

      hostRef.current.replaceChildren(campo)
      campoRef.current = campo
      setPronto(true)
      campo.focus()
    })

    return () => {
      vivo = false
    }
    // Roda uma vez: o valor inicial é semente, as edições seguintes vêm do
    // próprio campo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Deixa o pai limpar ou pré-preencher o campo sem remontar o componente.
  useEffect(() => {
    const campo = campoRef.current
    if (campo && valor !== campo.value) campo.value = valor
  }, [valor])

  return (
    <div className="card-inset">
      <div ref={hostRef} />
      {!pronto && (
        <p className="px-1 py-4 text-sm text-gray-500 dark:text-gray-400">
          Carregando teclado matemático…
        </p>
      )}
    </div>
  )
}
