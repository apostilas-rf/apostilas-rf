import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { z } from 'zod'

const updateConteudoSchema = z.object({
  capitulo: z.string().min(3),
  frente: z.enum(['A', 'B', 'C']).nullable().optional(),
  anoEscolar: z.string().optional(),
  grupoConteudo: z.enum(['NATUREZAS_MATEMATICA', 'HUMANAS_LINGUAGENS']),
  tipo: z.enum(['CONTEUDO', 'REVISAO']),
  topicos: z.array(z.string()).max(10),
  enemTopicos: z.array(z.object({ topico: z.string(), estrelas: z.number().int().min(1).max(5) })).max(10).optional(),
  enemTopico: z.string().optional().nullable(),
  enemEstrelas: z.number().min(1).max(5).optional().nullable(),
  conteudo: z.string().min(10),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

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

    const { capitulo, frente, anoEscolar, grupoConteudo, tipo, topicos, enemTopicos, enemTopico, enemEstrelas, conteudo } = validation.data

    // Buscar conteúdo
    const conteudoExistente = await db.conteudoCapitulo.findUnique({
      where: { id },
    })

    if (!conteudoExistente) {
      return NextResponse.json({ error: 'Conteúdo não encontrado' }, { status: 404 })
    }

    // Verificar permissão
    if (conteudoExistente.usuarioId !== userId) {
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 })
    }

    // Validar limite de páginas
    const estimadoPaginas = Math.ceil(conteudo.length / 3000)
    if (estimadoPaginas > 10) {
      return NextResponse.json(
        { error: `Conteúdo ultrapassou 10 páginas (estimado: ${estimadoPaginas})` },
        { status: 400 }
      )
    }

    // Atualizar
    const conteudoAtualizado = await db.conteudoCapitulo.update({
      where: { id },
      data: {
        capitulo,
        frente,
        anoEscolar,
        grupoConteudo,
        tipo,
        topicos,
        enemTopicos: enemTopicos ?? undefined,
        enemTopico: enemTopico || null,
        enemEstrelas: enemEstrelas || null,
        conteudo,
        estimadoPaginas,
      },
    })

    return NextResponse.json(
      { success: true, data: conteudoAtualizado },
      { status: 200 }
    )
  } catch (error) {
    console.error('PUT /api/conteudo-capitulos/[id] error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar conteúdo' },
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

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Buscar conteúdo
    const conteudo = await db.conteudoCapitulo.findUnique({
      where: { id },
      include: { apostila: true },
    })

    if (!conteudo) {
      return NextResponse.json({ error: 'Conteúdo não encontrado' }, { status: 404 })
    }

    // Verificar permissão (apenas criador pode deletar)
    if (conteudo.usuarioId !== userId) {
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 })
    }

    // Deletar
    await db.conteudoCapitulo.delete({ where: { id } })

    // Registrar no histórico
    await db.apostilaHistory.create({
      data: {
        apostilaId: conteudo.apostilaId,
        usuarioId: userId,
        statusNovo: conteudo.apostila.status,
        acao: 'CONTEUDO_DELETADO',
        descricao: `Capítulo "${conteudo.capitulo}" deletado`,
      },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/conteudo-capitulos/[id] error:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar conteúdo' },
      { status: 500 }
    )
  }
}
