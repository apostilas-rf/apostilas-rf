import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId || userRole !== 'PROFESSOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Buscar conteúdo
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

    // Verificar se é do professor
    if (conteudo.apostila.professorId !== userId) {
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 })
    }

    // Verificar se tem conteúdo preenchido
    if (!conteudo.conteudo || conteudo.conteudo.trim().length === 0) {
      return NextResponse.json(
        { error: 'Conteúdo não pode estar vazio' },
        { status: 400 }
      )
    }

    // Verificar limite de páginas se foi definido
    if (
      conteudo.paginasUtilizadas &&
      conteudo.estimadoPaginas &&
      conteudo.paginasUtilizadas > conteudo.estimadoPaginas
    ) {
      return NextResponse.json(
        { error: 'Número de páginas ultrapassa o limite permitido' },
        { status: 400 }
      )
    }

    // Atualizar status para "ENVIADO_REVISAO"
    const updated = await db.conteudoCapitulo.update({
      where: { id },
      data: {
        status: 'ENVIADO_REVISAO',
      },
      include: {
        apostila: {
          include: {
            professor: {
              select: { id: true, nome: true, email: true },
            },
          },
        },
      },
    })

    // Criar notificação para gestores
    const gestores = await db.user.findMany({
      where: { role: 'GESTOR' },
    })

    for (const gestor of gestores) {
      await db.notificacao.create({
        data: {
          usuarioId: gestor.id,
          apostilaId: updated.apostila.id,
          tipo: 'REVISAO',
          titulo: `Capítulo enviado para revisão: ${updated.capitulo}`,
          mensagem: `${updated.apostila.professor.nome} enviou o capítulo "${updated.capitulo}" da apostila "${updated.apostila.titulo}" para revisão inicial`,
          urlAcao: `/dashboard/apostilas/${updated.apostila.id}`,
        },
      })
    }

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200 }
    )
  } catch (error) {
    console.error('POST /api/conteudos/:id/enviar-revisao error:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar para revisão' },
      { status: 500 }
    )
  }
}
