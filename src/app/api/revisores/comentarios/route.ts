import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { z } from 'zod'

const comentarioSchema = z.object({
  apostilaId: z.string(),
  conteudo: z.string().min(10).max(1000),
  tipo: z.enum(['REVISAO']),
  categoriaApontamento: z.enum([
    'ORTOGRAFIA',
    'DIAGRAMACAO',
    'SUGESTAO_MELHORIA',
  ]),
  linhaAproximada: z.number().int().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId || userRole !== 'REVISOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = comentarioSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Buscar a apostila
    const apostila = await db.apostila.findUnique({
      where: { id: validation.data.apostilaId },
      include: { professor: { select: { id: true, nome: true, email: true } } },
    })

    if (!apostila) {
      return NextResponse.json(
        { error: 'Apostila não encontrada' },
        { status: 404 }
      )
    }

    // Criar comentário
    const comentario = await db.comentario.create({
      data: {
        apostilaId: validation.data.apostilaId,
        usuarioId: userId,
        conteudo: validation.data.conteudo,
        tipo: validation.data.tipo,
      },
      include: {
        usuario: { select: { id: true, nome: true, role: true } },
      },
    })

    // Criar notificação para o professor (e diagramador se houver atribuição)
    const usuarios = await db.user.findMany({
      where: {
        OR: [
          { id: apostila.professorId },
          {
            atribuicoes: {
              some: {
                apostilaId: validation.data.apostilaId,
                tarefa: 'DIAGRAMACAO',
              },
            },
          },
        ],
      },
    })

    const tipoApontamento = {
      ORTOGRAFIA: '🔤 Erro de Ortografia',
      DIAGRAMACAO: '📐 Erro de Diagramação',
      SUGESTAO_MELHORIA: '💡 Sugestão de Melhoria',
    }

    for (const usuario of usuarios) {
      await db.notificacao.create({
        data: {
          usuarioId: usuario.id,
          apostilaId: validation.data.apostilaId,
          tipo: 'REVISAO',
          titulo: `${tipoApontamento[validation.data.categoriaApontamento]} - ${apostila.titulo}`,
          mensagem: validation.data.conteudo.substring(0, 100) + '...',
          urlAcao: `/dashboard/revisores/${validation.data.apostilaId}`,
        },
      })
    }

    return NextResponse.json(
      { success: true, data: comentario },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/revisores/comentarios error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar comentário' },
      { status: 500 }
    )
  }
}
