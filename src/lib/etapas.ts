import type { StatusPrazo } from '@prisma/client'

// Ordem do fluxo. É esta lista que define a sequência mostrada na tela da
// apostila — não confie na ordem que o banco devolve.
export const ETAPAS = [
  { valor: 'REVISAO_INICIAL', label: 'Revisão inicial' },
  { valor: 'DIAGRAMACAO', label: 'Diagramação' },
  { valor: 'REVISAO_FINAL', label: 'Revisão final' },
  { valor: 'GRAFICA', label: 'Gráfica' },
] as const

export type Etapa = (typeof ETAPAS)[number]['valor']

export const ETAPA_LABEL: Record<Etapa, string> = ETAPAS.reduce(
  (acc, e) => ({ ...acc, [e.valor]: e.label }),
  {} as Record<Etapa, string>
)

/** Quantos dias faltam para a data, em dias inteiros de calendário. */
export function diasAte(data: Date | string): number {
  const prazo = new Date(data)
  // Zera a hora dos dois lados: sem isto, um prazo hoje às 08h aparece como
  // vencido para quem abre a tela às 09h.
  prazo.setHours(0, 0, 0, 0)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return Math.round((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Status é derivado, nunca gravado: uma linha marcada NO_PRAZO na terça estaria
 * mentindo na sexta. O banco guarda só a data e o `concluido`.
 */
export function statusDaEtapa(dataPrazo: Date | string, concluido: boolean): StatusPrazo {
  if (concluido) return 'COMPLETADO'
  const dias = diasAte(dataPrazo)
  if (dias < 0) return 'VENCIDO'
  if (dias <= 3) return 'VENCIMENTO_PROXIMO'
  return 'NO_PRAZO'
}

export const STATUS_LABEL: Record<StatusPrazo, string> = {
  NO_PRAZO: 'No prazo',
  VENCIMENTO_PROXIMO: 'Vence em breve',
  VENCIDO: 'Vencido',
  COMPLETADO: 'Concluído',
}
