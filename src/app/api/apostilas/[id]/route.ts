import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { z } from 'zod'

const updateApostilaSchema = z.object({
  titulo: z.string().min(3).optional(),
  materia: z.string().optional(),
  observacoes: z.string().optional(),
  prazoEstimado: z.string().datetime().optional(),
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

    const apostila = await db.apostila.findUnique({
      where: { id },
      include: {
        professor: {
          select: { id: true, nome: true, email: true },
        },
        atribuicoes: {
          include: {
            usuario: {
              select: { id: true, nome: true, email: true, role: true },
            },
          },
        },
        historicoStatus: {
          include: {
            usuario: {
              select: { id: true, nome: true },
            },
          },
          orderBy: { criadoEm: 'desc' },
        },
        arquivos: {
          include: {
            usuario: {
              select: { id: true, nome: true },
            },
          },
          orderBy: { criadoEm: 'desc' },
        },
        comentarios: {
          include: {
            usuario: {
              select: { id: true, nome: true },
            },
          },
          orderBy: { criadoEm: 'desc' },
        },
      },
    })

    if (!apostila) {
      return NextResponse.json(
        { error: 'Apostila não encontrada' },
        { status: 404 }
      )
    }

    // Security: Check if user has permission to access this apostila
    const userRole = headersList.get('x-user-role')
    const isOwner = apostila.professor.id === userId
    const isGestor = userRole === 'GESTOR'
    const isAtribuido = apostila.atribuicoes.some(a => a.usuario.id === userId)

    if (!isOwner && !isGestor && !isAtribuido) {
      return NextResponse.json(
        { error: 'Acesso negado: você não tem permissão para acessar esta apostila' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: true, data: apostila },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/apostilas/:id error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar apostila' },
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

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Validar dados
    const validation = updateApostilaSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Buscar apostila
    const apostila = await db.apostila.findUnique({ where: { id } })
    if (!apostila) {
      return NextResponse.json(
        { error: 'Apostila não encontrada' },
        { status: 404 }
      )
    }

    // Apenas professor (criador) ou GESTOR pode editar
    if (userRole !== 'GESTOR' && apostila.professorId !== userId) {
      return NextResponse.json(
        { error: 'Permissão negada' },
        { status: 403 }
      )
    }

    // Atualizar apostila
    const updated = await db.apostila.update({
      where: { id },
      data: {
        titulo: validation.data.titulo,
        materia: validation.data.materia,
        observacoes: validation.data.observacoes,
        prazoEstimado: validation.data.prazoEstimado
          ? new Date(validation.data.prazoEstimado)
          : undefined,
      },
      include: {
        professor: {
          select: { id: true, nome: true, email: true },
        },
      },
    })

    // Se prazo foi definido, criar notificação para o professor
    if (validation.data.prazoEstimado) {
      const prazoDt = new Date(validation.data.prazoEstimado)
      await db.notificacao.create({
        data: {
          usuarioId: apostila.professorId,
          apostilaId: id,
          tipo: 'OUTRAS',
          titulo: `Prazo definido: ${apostila.titulo}`,
          mensagem: `Gestor definiu prazo de envio para ${prazoDt.toLocaleDateString('pt-BR')}`,
          urlAcao: `/dashboard/apostilas/${id}`,
        },
      })
    }

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200 }
    )
  } catch (error) {
    console.error('PATCH /api/apostilas/:id error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar apostila' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
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

    // Soft delete (marcar como deletado)
    const apostila = await db.apostila.findUnique({ where: { id } })
    if (!apostila) {
      return NextResponse.json(
        { error: 'Apostila não encontrada' },
        { status: 404 }
      )
    }

    // Deletar registros relacionados primeiro
    await db.apostilaHistory.deleteMany({ where: { apostilaId: id } })
    await db.apostilaArquivo.deleteMany({ where: { apostilaId: id } })
    await db.userAssignment.deleteMany({ where: { apostilaId: id } })
    await db.comentario.deleteMany({ where: { apostilaId: id } })
    await db.notificacao.deleteMany({ where: { apostilaId: id } })
    await db.diagramacaoProgresso.deleteMany({ where: { apostilaId: id } })
    await db.problemaaDiagramacao.deleteMany({ where: { apostilaId: id } })
    await db.conteudoCapitulo.deleteMany({ where: { apostilaId: id } })

    // Deletar apostila
    await db.apostila.delete({ where: { id } })

    return NextResponse.json(
      { success: true, message: 'Apostila deletada' },
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE /api/apostilas/:id error:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar apostila' },
      { status: 500 }
    )
  }
}
