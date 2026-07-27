import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const apostilaId = searchParams.get('apostilaId')
    const setor = searchParams.get('setor')

    let where: any = {}

    if (apostilaId) {
      where.apostilaId = apostilaId
    }

    if (setor) {
      where.tarefa = setor
    }

    const prazos = await db.userAssignment.findMany({
      where: {
        ...where,
        prazoEntrega: {
          not: null,
        },
      },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true },
        },
        apostila: {
          select: { id: true, titulo: true, materia: true },
        },
      },
      orderBy: { prazoEntrega: 'asc' },
    })

    return NextResponse.json(
      { success: true, data: prazos },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/prazos error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar prazos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId || userRole !== 'GESTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { apostilaId, setor, usuarioId, prazoEntrega } = body

    if (!apostilaId || !prazoEntrega) {
      return NextResponse.json(
        { error: 'Selecione a apostila e a data de entrega' },
        { status: 400 }
      )
    }

    if (!usuarioId) {
      return NextResponse.json(
        { error: 'Selecione o responsável pelo prazo' },
        { status: 400 }
      )
    }

    const tarefa = setor || 'DIAGRAMACAO'

    const apostila = await db.apostila.findUnique({
      where: { id: apostilaId },
    })

    if (!apostila) {
      return NextResponse.json(
        { error: 'Apostila não encontrada' },
        { status: 404 }
      )
    }

    const responsavel = await db.user.findUnique({
      where: { id: usuarioId },
    })

    if (!responsavel || !responsavel.ativo) {
      return NextResponse.json(
        { error: 'Responsável não encontrado ou inativo' },
        { status: 404 }
      )
    }

    const prazoDate = new Date(prazoEntrega)
    const agora = new Date()
    let statusPrazo = 'NO_PRAZO'

    if (prazoDate < agora) {
      statusPrazo = 'VENCIDO'
    } else {
      const diasParaVencer = Math.ceil(
        (prazoDate.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (diasParaVencer <= 3) {
        statusPrazo = 'VENCIMENTO_PROXIMO'
      }
    }

    // Cria a atribuição se ainda não existir, ou apenas atualiza o prazo
    const prazo = await db.userAssignment.upsert({
      where: {
        usuarioId_apostilaId_tarefa: {
          usuarioId,
          apostilaId,
          tarefa,
        },
      },
      create: {
        usuarioId,
        apostilaId,
        tarefa,
        prazoAtribuido: agora,
        prazoEntrega: prazoDate,
        statusPrazo: statusPrazo as any,
      },
      update: {
        prazoEntrega: prazoDate,
        statusPrazo: statusPrazo as any,
      },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true },
        },
        apostila: {
          select: { id: true, titulo: true },
        },
      },
    })

    return NextResponse.json(
      { success: true, data: prazo },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/prazos error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar prazo' },
      { status: 500 }
    )
  }
}
