import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { z } from 'zod'
import { enviarEmail, templateRespostaProblemaDiagramacao } from '@/lib/email'

const updateProblemaSchema = z.object({
  respostaProf: z.string().min(5),
})

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

    const body = await request.json()
    const validation = updateProblemaSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Buscar problema
    const problema = await db.problemaaDiagramacao.findUnique({
      where: { id: params.id },
      include: {
        diagramador: true,
        professor: true,
        apostila: true,
      },
    })

    if (!problema) {
      return NextResponse.json({ error: 'Problema não encontrado' }, { status: 404 })
    }

    // Validar permissões (apenas professor pode responder)
    if (problema.professorId !== userId) {
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 })
    }

    // Atualizar problema
    const problemaAtualizado = await db.problemaaDiagramacao.update({
      where: { id: params.id },
      data: {
        respostaProf: validation.data.respostaProf,
        status: 'RESPONDIDO',
        respondidoEm: new Date(),
        respostaPorId: userId,
      },
      include: {
        diagramador: true,
        professor: true,
        apostila: true,
      },
    })

    // Enviar email para diagramador
    try {
      const html = templateRespostaProblemaDiagramacao(
        problema.diagramador.nome,
        problema.apostila.titulo,
        problema.descricao,
        validation.data.respostaProf,
        problema.professor.nome
      )

      await enviarEmail(
        problema.diagramador.email,
        `Resposta ao Problema: ${problema.apostila.titulo}`,
        html
      )
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError)
    }

    // Criar notificação para diagramador
    await db.notificacao.create({
      data: {
        usuarioId: problema.diagramadorId,
        apostilaId: problema.apostilaId,
        tipo: 'REVISAO',
        titulo: `Resposta ao Problema: ${problema.apostila.titulo}`,
        mensagem: `${problema.professor.nome} respondeu ao seu problema`,
        urlAcao: `/dashboard/diagramadores/${problema.apostilaId}?tab=problemas`,
      },
    })

    // Registrar no histórico
    await db.apostilaHistory.create({
      data: {
        apostilaId: problema.apostilaId,
        usuarioId: userId,
        statusNovo: problema.apostila.status,
        acao: 'PROBLEMA_RESPONDIDO',
        descricao: `Problema respondido pelo professor`,
      },
    })

    return NextResponse.json(
      { success: true, data: problemaAtualizado },
      { status: 200 }
    )
  } catch (error) {
    console.error('PATCH /api/diagramadores/problemas/[id] error:', error)
    return NextResponse.json(
      { error: 'Erro ao responder problema' },
      { status: 500 }
    )
  }
}
