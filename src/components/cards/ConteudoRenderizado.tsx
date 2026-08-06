'use client'

import { Fragment, type ReactNode } from 'react'
import { InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'

// Renderiza o subconjunto que o editor de capítulos realmente produz:
// **negrito**, *itálico*, `código`, ~~tachado~~, <u>sublinhado</u>,
// ![alt](url) e $latex$.
//
// Tudo vira elemento React — nada de dangerouslySetInnerHTML. O texto vem de
// quem escreve a apostila, então injetar HTML cru aqui abriria XSS para
// qualquer um que abrisse o capítulo.
const PADRAO =
  /!\[([^\]]*)\]\(([^)\s]+)\)|\$([^$\n]+)\$|\*\*([^*]+)\*\*|~~([^~]+)~~|`([^`]+)`|<u>([\s\S]*?)<\/u>|\*([^*\n]+)\*/g

function renderizarLinha(linha: string, chaveBase: string): ReactNode[] {
  const partes: ReactNode[] = []
  let ultimo = 0
  let match: RegExpExecArray | null

  PADRAO.lastIndex = 0
  while ((match = PADRAO.exec(linha)) !== null) {
    if (match.index > ultimo) {
      partes.push(linha.slice(ultimo, match.index))
    }

    const chave = `${chaveBase}-${match.index}`
    const [, imgAlt, imgUrl, latex, negrito, tachado, codigo, sublinhado, italico] = match

    if (imgUrl !== undefined) {
      partes.push(
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={chave}
          src={imgUrl}
          alt={imgAlt || ''}
          className="my-3 max-w-full rounded-2xl"
        />
      )
    } else if (latex !== undefined) {
      // renderError, e não try/catch: o KaTeX só lança quando o React renderiza
      // o elemento, bem depois desta função. Sem isto, uma fórmula com um
      // comando inválido derrubaria a visualização inteira.
      partes.push(
        <InlineMath
          key={chave}
          renderError={() => (
            <code
              title="Fórmula com erro de escrita"
              className="rounded bg-red-500/10 px-1 text-red-600 dark:text-red-400"
            >
              {latex}
            </code>
          )}
        >
          {latex}
        </InlineMath>
      )
    } else if (negrito !== undefined) {
      partes.push(<strong key={chave}>{negrito}</strong>)
    } else if (tachado !== undefined) {
      partes.push(<s key={chave}>{tachado}</s>)
    } else if (codigo !== undefined) {
      partes.push(
        <code key={chave} className="rounded bg-gray-500/10 px-1.5 py-0.5 text-[0.9em]">
          {codigo}
        </code>
      )
    } else if (sublinhado !== undefined) {
      partes.push(<u key={chave}>{sublinhado}</u>)
    } else if (italico !== undefined) {
      partes.push(<em key={chave}>{italico}</em>)
    }

    ultimo = match.index + match[0].length
  }

  if (ultimo < linha.length) partes.push(linha.slice(ultimo))
  return partes
}

export function ConteudoRenderizado({ texto }: { texto: string }) {
  // Linha em branco separa parágrafo; linha única vira quebra simples.
  const paragrafos = texto.split(/\n{2,}/)

  return (
    <div className="text-[0.95rem] leading-relaxed text-gray-700 dark:text-gray-300">
      {paragrafos.map((paragrafo, i) => (
        <p key={i} className="mb-4 last:mb-0">
          {paragrafo.split('\n').map((linha, j) => (
            <Fragment key={j}>
              {j > 0 && <br />}
              {renderizarLinha(linha, `${i}-${j}`)}
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  )
}
