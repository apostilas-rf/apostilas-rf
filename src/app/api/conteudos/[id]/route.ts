import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { z } from 'zod'

const updateConteudoSchema = z.object({
  conteudo: z.string(),
  estimadoPaginas: z.number().int().positive().optional(),
  paginasUtilizadas: z.number().int().positive().optional(),
  topicos: z.array(z.string()).optional(),
  imagensUrls: z.array(z.string()).optional(),
  enemTopico: z.string().optional(),
  enemEstrelas: z.number().int().min(1).max(5).optional(),
})

export async function GET(
  _: any,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const conteudo = await db.conteudoCapitulo.findUnique({
      where: { id },
      include: {
        apostila: {
          include: { template: true },
        },
        usuario: {
          select: { id: true, nome: true },
        },
      },
    })

    if (!conteudo) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar permissão: professor só pode ver seu próprio conteúdo
    if (userRole === 'PROFESSOR' && conteudo.apostila.professorId !== userId) {
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 })
    }

    return NextResponse.json(
      { success: true, data: conteudo },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/conteudos/:id error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar conteúdo' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  _: any,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const validation = updateConteudoSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Buscar o conteúdo e verificar permissões
    const conteudo = await db.conteudoCapitulo.findUnique({
      where: { id },
      include: { apostila: true },
    })

    if (!conteudo) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado' },
        { status: 404 }
      )
    }

    // Apenas o professor pode editar seu próprio conteúdo
    if (userRole === 'PROFESSOR' && conteudo.apostila.professorId !== userId) {
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 })
    }

    const updated = await db.conteudoCapitulo.update({
      where: { id },
      data: {
        conteudo: validation.data.conteudo,
        estimadoPaginas: validation.data.estimadoPaginas,
        paginasUtilizadas: validation.data.paginasUtilizadas,
        topicos: validation.data.topicos,
        imagensUrls: validation.data.imagensUrls,
        enemTopico: validation.data.enemTopico,
        enemEstrelas: validation.data.enemEstrelas,
      },
      include: {
        apostila: { include: { template: true } },
      },
    })

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200 }
    )
  } catch (error) {
    console.error('PATCH /api/conteudos/:id error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar conteúdo' },
      { status: 500 }
    )
  }
}
