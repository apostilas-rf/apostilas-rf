import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { z } from 'zod'

const createTemplateSchema = z.object({
  titulo: z.string().min(3),
  serie: z.enum(['PRIMEIRO_ANO', 'SEGUNDO_ANO', 'TERCEIRO_ANO', 'CURSINHO']),
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
  }),
})

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const serie = searchParams.get('serie')

    const templates = await db.template.findMany({
      where: serie && serie !== 'TODOS' ? { serie: serie as any } : {},
      include: {
        _count: {
          select: { apostilas: true },
        },
      },
      // Ordem definida arrastando os cards; criadoEm desempata
      orderBy: [{ ordem: 'asc' }, { criadoEm: 'desc' }],
    })

    return NextResponse.json(
      { success: true, data: templates },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/templates error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar templates' },
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

    const validation = createTemplateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const template = await db.template.create({
      data: {
        titulo: validation.data.titulo,
        serie: validation.data.serie,
        descricao: validation.data.descricao,
        estrutura: validation.data.estrutura,
      },
    })

    return NextResponse.json(
      { success: true, data: template },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/templates error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar template' },
      { status: 500 }
    )
  }
}
