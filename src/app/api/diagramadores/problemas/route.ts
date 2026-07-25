import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { z } from 'zod'
import { enviarEmail, templateProblemaRelatado } from '@/lib/email'

const addProblemaSchema = z.object({
  apostilaId: z.string().min(1),
  descricao: z.string().min(10),
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
    const validation = addProblemaSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { apostilaId, descricao } = validation.data

    // Buscar apostila e professor
    const apostila = await db.apostila.findUnique({
      where: { id: apostilaId },
      include: { professor: true },
    })

    if (!apostila) {
      return NextResponse.json({ error: 'Apostila não encontrada' }, { status: 404 })
    }

    // Criar problema
    const problema = await db.problemaaDiagramacao.create({
      data: {
        apostilaId,
        diagramadorId: userId,
        professorId: apostila.professorId,
        descricao,
        status: 'ABERTO',
      },
      include: {
        diagramador: true,
        professor: true,
        apostila: true,
      },
    })

    // Enviar email para o professor
    try {
      const html = templateProblemaRelatado(
        apostila.professor.nome,
        apostila.titulo,
        descricao,
        problema.diagramador.nome
      )

      await enviarEmail(
        apostila.professor.email,
        `Problema na Diagramação: ${apostila.titulo}`,
        html
      )
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError)
    }

    // Criar notificação para professor
    await db.notificacao.create({
      data: {
        usuarioId: apostila.professorId,
        apostilaId,
        tipo: 'REVISAO',
        titulo: `Problema na Diagramação: ${apostila.titulo}`,
        mensagem: `${problema.diagramador.nome} relatou um problema: "${descricao.substring(0, 50)}..."`,
        urlAcao: `/dashboard/apostilas/${apostilaId}?tab=problemas`,
      },
    })

    // Registrar no histórico
    await db.apostilaHistory.create({
      data: {
        apostilaId,
        usuarioId: userId,
        statusNovo: apostila.status,
        acao: 'PROBLEMA_REPORTADO',
        descricao: `Problema na diagramação: ${descricao.substring(0, 50)}...`,
      },
    })

    return NextResponse.json(
      { success: true, data: problema },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/diagramadores/problemas error:', error)
    return NextResponse.json(
      { error: 'Erro ao reportar problema' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const apostilaId = request.nextUrl.searchParams.get('apostilaId')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const problemas = await db.problemaaDiagramacao.findMany({
      where: {
        apostilaId: apostilaId || undefined,
        OR: [
          { diagramadorId: userId },
          { professorId: userId },
        ],
      },
      include: {
        diagramador: true,
        professor: true,
        apostila: true,
      },
      orderBy: { criadoEm: 'desc' },
    })

    return NextResponse.json(
      { success: true, data: problemas },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/diagramadores/problemas error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar problemas' },
      { status: 500 }
    )
  }
}
