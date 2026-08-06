import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'

// Apontamentos que o revisor deixou num capítulo. Lê quem escreveu o capítulo,
// o revisor e o gestor.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const capitulo = await db.conteudoCapitulo.findUnique({
      where: { id },
      select: { id: true, usuarioId: true },
    })

    if (!capitulo) {
      return NextResponse.json({ error: 'Capítulo não encontrado' }, { status: 404 })
    }

    const podeVer =
      capitulo.usuarioId === userId || userRole === 'REVISOR' || userRole === 'GESTOR'
    if (!podeVer) {
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 })
    }

    const apontamentos = await db.comentario.findMany({
      where: { capituloId: id },
      include: { usuario: { select: { id: true, nome: true, role: true } } },
      // Abertos primeiro: é o que ainda pede ação.
      orderBy: [{ resolvido: 'asc' }, { criadoEm: 'desc' }],
    })

    return NextResponse.json({ success: true, data: apontamentos }, { status: 200 })
  } catch (error) {
    console.error('GET /api/conteudo-capitulos/[id]/apontamentos error:', error)
    return NextResponse.json({ error: 'Erro ao buscar apontamentos' }, { status: 500 })
  }
}

// Marcar resolvido/reabrir. Quem corrige o texto é o professor, então é ele
// quem fecha — junto com o gestor.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const capitulo = await db.conteudoCapitulo.findUnique({
      where: { id },
      select: { usuarioId: true },
    })
    if (!capitulo) {
      return NextResponse.json({ error: 'Capítulo não encontrado' }, { status: 404 })
    }
    if (capitulo.usuarioId !== userId && userRole !== 'GESTOR') {
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    const apontamentoId = body?.apontamentoId
    if (!apontamentoId || typeof apontamentoId !== 'string') {
      return NextResponse.json({ error: 'Informe o apontamento' }, { status: 400 })
    }

    const alvo = await db.comentario.findUnique({ where: { id: apontamentoId } })
    if (!alvo || alvo.capituloId !== id) {
      return NextResponse.json(
        { error: 'Apontamento não encontrado neste capítulo' },
        { status: 404 }
      )
    }

    const resolvido = Boolean(body?.resolvido)
    const atualizado = await db.comentario.update({
      where: { id: apontamentoId },
      data: { resolvido, resolvidoEm: resolvido ? new Date() : null },
      include: { usuario: { select: { id: true, nome: true, role: true } } },
    })

    return NextResponse.json({ success: true, data: atualizado }, { status: 200 })
  } catch (error) {
    console.error('PATCH /api/conteudo-capitulos/[id]/apontamentos error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar apontamento' }, { status: 500 })
  }
}
