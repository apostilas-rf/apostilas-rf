import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { ETAPA_LABEL, diasAte, type Etapa } from '@/lib/etapas'

// Quantos dias uma apostila pode ficar parada numa etapa antes de virar alerta.
const DIAS_PARADA = 7

export interface ItemAtencao {
  id: string
  gravidade: 'critico' | 'aviso'
  titulo: string
  detalhe: string
  href: string
}

/**
 * Junta num lugar só o que hoje exige abrir Professores, Diagramação e Revisão
 * separadamente. Só devolve o que pede ação — lista vazia é boa notícia.
 */
export async function GET() {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Visão de gestão: quem não é gestor/direção não tem por que ver o painel
    // consolidado da escola inteira.
    if (!['GESTOR', 'DIRECAO', 'PROPRIETARIO'].includes(userRole || '')) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 })
    }

    const itens: ItemAtencao[] = []

    // 1. Prazos de etapa vencidos ou vencendo
    const prazos = await db.deadline.findMany({
      where: { concluido: false },
      include: {
        apostila: { select: { id: true, titulo: true } },
        responsavel: { select: { nome: true } },
      },
      orderBy: { dataPrazo: 'asc' },
    })

    for (const p of prazos) {
      const dias = diasAte(p.dataPrazo)
      if (dias > 3) continue

      const etapa = ETAPA_LABEL[p.etapa as Etapa] || p.etapa
      const quem = p.responsavel?.nome || 'sem responsável'

      itens.push({
        id: `prazo-${p.id}`,
        gravidade: dias < 0 ? 'critico' : 'aviso',
        titulo: p.apostila.titulo,
        detalhe:
          dias < 0
            ? `${etapa} vencida há ${Math.abs(dias)}d — ${quem}`
            : dias === 0
              ? `${etapa} vence hoje — ${quem}`
              : `${etapa} vence em ${dias}d — ${quem}`,
        href: `/dashboard/apostilas/${p.apostila.id}`,
      })
    }

    // 2. Apostilas paradas na mesma etapa há muito tempo. `atualizadoEm` muda a
    // cada alteração, então parada aqui significa sem nenhum movimento.
    const limite = new Date()
    limite.setDate(limite.getDate() - DIAS_PARADA)

    const paradas = await db.apostila.findMany({
      where: {
        status: { in: ['EM_REVISAO_INICIAL', 'EM_DIAGRAMACAO', 'EM_REVISAO_FINAL', 'EM_AJUSTE'] },
        atualizadoEm: { lt: limite },
      },
      select: { id: true, titulo: true, status: true, atualizadoEm: true },
      orderBy: { atualizadoEm: 'asc' },
    })

    const ROTA_POR_STATUS: Record<string, string> = {
      EM_REVISAO_INICIAL: '/dashboard/revisores',
      EM_REVISAO_FINAL: '/dashboard/revisores',
      EM_AJUSTE: '/dashboard/revisores',
      EM_DIAGRAMACAO: '/dashboard/diagramadores',
    }

    for (const a of paradas) {
      const dias = Math.abs(diasAte(a.atualizadoEm))
      itens.push({
        id: `parada-${a.id}`,
        gravidade: dias >= DIAS_PARADA * 2 ? 'critico' : 'aviso',
        titulo: a.titulo,
        detalhe: `Sem movimento há ${dias}d em ${a.status.replace(/_/g, ' ').toLowerCase()}`,
        href: ROTA_POR_STATUS[a.status] || `/dashboard/apostilas/${a.id}`,
      })
    }

    // 3. Apontamentos de revisão que o professor ainda não resolveu
    const apontamentos = await db.comentario.groupBy({
      by: ['apostilaId'],
      where: { capituloId: { not: null }, resolvido: false },
      _count: { _all: true },
    })

    if (apontamentos.length > 0) {
      const titulos = await db.apostila.findMany({
        where: { id: { in: apontamentos.map((a) => a.apostilaId) } },
        select: { id: true, titulo: true },
      })
      const porId = new Map(titulos.map((t) => [t.id, t.titulo]))

      for (const a of apontamentos) {
        itens.push({
          id: `apontamento-${a.apostilaId}`,
          gravidade: 'aviso',
          titulo: porId.get(a.apostilaId) || 'Apostila',
          detalhe: `${a._count._all} apontamento(s) de revisão em aberto`,
          href: `/dashboard/apostilas/${a.apostilaId}`,
        })
      }
    }

    // Crítico primeiro: é o que decide onde o gestor olha antes.
    itens.sort((x, y) => (x.gravidade === y.gravidade ? 0 : x.gravidade === 'critico' ? -1 : 1))

    return NextResponse.json({ success: true, data: itens }, { status: 200 })
  } catch (error) {
    console.error('GET /api/dashboard/atencao error:', error)
    return NextResponse.json({ error: 'Erro ao montar o painel de atenção' }, { status: 500 })
  }
}
