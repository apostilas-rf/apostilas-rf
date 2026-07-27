import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { z } from 'zod'

const updateTemplateSchema = z.object({
  titulo: z.string().min(3).optional(),
  descricao: z.string().optional(),
  estrutura: z.object({
    capitulos: z.array(z.object({
      nome: z.string(),
      secoes: z.array(z.any()).optional(),
    })),
    identidadeVisual: z.object({
      corPrimaria: z.string(),
      corSecundaria: z.string(),
      fonte: z.string().optional(),
    }),
  }).optional(),
})

export async function GET(
  _: any,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const template = await db.template.findUnique({
      where: { id },
      include: {
        apostilas: {
          select: { id: true, titulo: true },
        },
        _count: {
          select: { apostilas: true },
        },
      },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, data: template },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/templates/:id error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar template' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId || userRole !== 'GESTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const validation = updateTemplateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const template = await db.template.findUnique({ where: { id } })
    if (!template) {
      return NextResponse.json(
        { error: 'Template não encontrado' },
        { status: 404 }
      )
    }

    const updated = await db.template.update({
      where: { id },
      data: {
        titulo: validation.data.titulo,
        descricao: validation.data.descricao,
        estrutura: validation.data.estrutura,
      },
      include: {
        _count: {
          select: { apostilas: true },
        },
      },
    })

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200 }
    )
  } catch (error) {
    console.error('PATCH /api/templates/:id error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar template' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _: any,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId || userRole !== 'GESTOR') {
      return NextResponse.json(
        { error: 'Apenas GESTOR pode deletar' },
        { status: 403 }
      )
    }

    const { id } = await params

    const template = await db.template.findUnique({
      where: { id },
      include: { _count: { select: { apostilas: true } } },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template não encontrado' },
        { status: 404 }
      )
    }

    if ((template._count?.apostilas || 0) > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar template com apostilas vinculadas' },
        { status: 400 }
      )
    }

    await db.template.delete({ where: { id } })

    return NextResponse.json(
      { success: true, message: 'Template deletado' },
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE /api/templates/:id error:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar template' },
      { status: 500 }
    )
  }
}
