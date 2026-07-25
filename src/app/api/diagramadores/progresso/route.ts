import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { z } from 'zod'

const updateProgressSchema = z.object({
  apostilaId: z.string().min(1),
  paginaInicio: z.number().min(0),
  paginaFim: z.number().min(0),
  paginasTotal: z.number().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId || userRole !== 'DIAGRAMADOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = updateProgressSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { apostilaId, paginaInicio, paginaFim, paginasTotal } = validation.data

    // Calcular progresso
    const paginasDiagramadas = paginaFim - paginaInicio + 1
    const percentualProgresso = Math.round((paginasDiagramadas / paginasTotal) * 100)

    // Atualizar ou criar progresso
    const progresso = await db.diagramacaoProgresso.upsert({
      where: {
        apostilaId_diagramadorId: {
          apostilaId,
          diagramadorId: userId,
        },
      },
      update: {
        paginaInicio,
        paginaFim,
        paginasTotal,
        percentualProgresso,
      },
      create: {
        apostilaId,
        diagramadorId: userId,
        paginaInicio,
        paginaFim,
        paginasTotal,
        percentualProgresso,
      },
    })

    // Registrar no histórico
    await db.apostilaHistory.create({
      data: {
        apostilaId,
        usuarioId: userId,
        statusNovo: (await db.apostila.findUnique({ where: { id: apostilaId } }))?.status!,
        acao: 'DIAGRAMACAO_PROGRESSO',
        descricao: `Diagramação atualizada: páginas ${paginaInicio}-${paginaFim} (${percentualProgresso}%)`,
      },
    })

    return NextResponse.json(
      { success: true, data: progresso },
      { status: 200 }
    )
  } catch (error) {
    console.error('POST /api/diagramadores/progresso error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar progresso' },
      { status: 500 }
    )
  }
}
