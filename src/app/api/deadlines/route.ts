import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { z } from 'zod'
import { statusDaEtapa } from '@/lib/etapas'

const ETAPAS_VALIDAS = ['REVISAO_INICIAL', 'DIAGRAMACAO', 'REVISAO_FINAL', 'GRAFICA'] as const

const salvarPrazoSchema = z.object({
  apostilaId: z.string().min(1, 'Selecione a apostila'),
  etapa: z.enum(ETAPAS_VALIDAS),
  dataPrazo: z.string().min(1, 'Informe a data de entrega'),
  responsavelId: z.string().nullable().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const apostilaId = searchParams.get('apostilaId')
    const etapa = searchParams.get('etapa')

    const where: any = {}
    if (apostilaId) where.apostilaId = apostilaId
    if (etapa && ETAPAS_VALIDAS.includes(etapa as any)) where.etapa = etapa

    const prazos = await db.deadline.findMany({
      where,
      include: {
        responsavel: { select: { id: true, nome: true, email: true } },
        apostila: { select: { id: true, titulo: true, materia: true, serie: true } },
      },
      orderBy: { dataPrazo: 'asc' },
    })

    // O status vai calculado na resposta para a tela não repetir a regra.
    const data = prazos.map((p) => ({
      ...p,
      statusPrazo: statusDaEtapa(p.dataPrazo, p.concluido),
    }))

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    console.error('GET /api/deadlines error:', error)
    return NextResponse.json({ error: 'Erro ao buscar prazos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (userRole !== 'GESTOR') {
      return NextResponse.json(
        { error: 'Apenas o gestor pode definir prazos' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = salvarPrazoSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 }
      )
    }

    const { apostilaId, etapa, dataPrazo, responsavelId } = validation.data

    const data = new Date(dataPrazo)
    if (isNaN(data.getTime())) {
      return NextResponse.json({ error: 'Data de entrega inválida' }, { status: 400 })
    }

    const apostila = await db.apostila.findUnique({ where: { id: apostilaId } })
    if (!apostila) {
      return NextResponse.json({ error: 'Apostila não encontrada' }, { status: 404 })
    }

    if (responsavelId) {
      const responsavel = await db.user.findUnique({ where: { id: responsavelId } })
      if (!responsavel || !responsavel.ativo) {
        return NextResponse.json(
          { error: 'Responsável não encontrado ou inativo' },
          { status: 404 }
        )
      }
    }

    // Uma etapa tem um prazo só por apostila: redefinir sobrescreve.
    const prazo = await db.deadline.upsert({
      where: { apostilaId_etapa: { apostilaId, etapa } },
      create: { apostilaId, etapa, dataPrazo: data, responsavelId: responsavelId || null },
      update: { dataPrazo: data, responsavelId: responsavelId || null },
      include: {
        responsavel: { select: { id: true, nome: true, email: true } },
        apostila: { select: { id: true, titulo: true, materia: true, serie: true } },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: { ...prazo, statusPrazo: statusDaEtapa(prazo.dataPrazo, prazo.concluido) },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('POST /api/deadlines error:', error)
    return NextResponse.json({ error: 'Erro ao salvar prazo' }, { status: 500 })
  }
}
