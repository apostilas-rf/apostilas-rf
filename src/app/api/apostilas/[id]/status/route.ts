import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { z } from 'zod'
import { STATUS_TRANSITIONS, APOSTILA_STATUS } from '@/lib/constants'
import { enviarEmail, templateStatusMudou } from '@/lib/email'
import type { ApostilaStatus } from '@/types'

const statusSchema = z.object({
  novoStatus: z.enum([
    'RECEBIDO',
    'EM_REVISAO_INICIAL',
    'EM_DIAGRAMACAO',
    'EM_REVISAO_FINAL',
    'EM_AJUSTE',
    'FINALIZADO',
    'ENVIADO',
  ]),
  descricao: z.string().optional(),
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

    const { id } = await params
    console.log('PATCH /api/apostilas/:id/status', { id, userId, userRole })
    const body = await request.json()
    console.log('Body recebido:', body)

    // Validar dados
    const validation = statusSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { novoStatus, descricao } = validation.data

    // Buscar apostila
    console.log('Buscando apostila:', id)
    const apostila = await db.apostila.findUnique({ where: { id } })
    console.log('Apostila encontrada:', apostila?.id, 'Status atual:', apostila?.status)

    if (!apostila) {
      return NextResponse.json(
        { error: 'Apostila não encontrada' },
        { status: 404 }
      )
    }

    // Validar transição de status
    const transicoes = STATUS_TRANSITIONS[apostila.status as ApostilaStatus]
    console.log('Transições permitidas:', transicoes)
    console.log('Novo status solicitado:', novoStatus)

    // Permitir reversões para GESTOR
    if (!transicoes.includes(novoStatus as ApostilaStatus)) {
      // Se não for transição forward, apenas GESTOR pode reverter
      if (userRole !== 'GESTOR') {
        return NextResponse.json(
          {
            error: `Transição inválida de ${apostila.status} para ${novoStatus}`,
            detalhes: `Transições permitidas: ${transicoes.join(', ') || 'nenhuma'}. Apenas GESTOR pode reverter.`,
          },
          { status: 400 }
        )
      }
    }

    // Validar permissões por tipo de transição
    if (
      ['EM_REVISAO_INICIAL', 'EM_DIAGRAMACAO', 'EM_DIAGRAMACAO', 'EM_REVISAO_FINAL'].includes(
        novoStatus
      )
    ) {
      // Apenas GESTOR pode fazer essas transições
      if (userRole !== 'GESTOR') {
        return NextResponse.json(
          { error: 'Apenas GESTOR pode fazer essa transição' },
          { status: 403 }
        )
      }
    }

    if (novoStatus === 'EM_AJUSTE' || novoStatus === 'FINALIZADO') {
      // Apenas REVISOR pode fazer essas transições
      if (userRole !== 'REVISOR') {
        return NextResponse.json(
          { error: 'Apenas REVISOR pode fazer essa transição' },
          { status: 403 }
        )
      }
    }

    if (novoStatus === 'ENVIADO') {
      // Apenas EDITOR pode finalizar
      if (userRole !== 'EDITOR' && userRole !== 'GESTOR') {
        return NextResponse.json(
          { error: 'Apenas EDITOR pode enviar para gráfica' },
          { status: 403 }
        )
      }
    }

    // Atualizar status
    const statusAnterior = apostila.status
    const updated = await db.apostila.update({
      where: { id },
      data: {
        status: novoStatus as ApostilaStatus,
        dataFinal: novoStatus === 'ENVIADO' ? new Date() : undefined,
      },
    })

    // Registrar no histórico
    await db.apostilaHistory.create({
      data: {
        apostilaId: id,
        usuarioId: userId!,
        statusAnterior: statusAnterior as ApostilaStatus,
        statusNovo: novoStatus as ApostilaStatus,
        acao: 'STATUS_MUDOU',
        descricao: descricao || `Status mudou de ${statusAnterior} para ${novoStatus}`,
      },
    })

    // Buscar usuário que fez a mudança e professor
    const usuario = await db.user.findUnique({ where: { id: userId } })
    const professor = await db.user.findUnique({ where: { id: apostila.professorId } })

    if (usuario && professor) {
      // Notificar professor in-app
      await db.notificacao.create({
        data: {
          usuarioId: apostila.professorId,
          apostilaId: id,
          tipo: 'STATUS_MUDOU',
          titulo: 'Status da Apostila Atualizado',
          mensagem: `"${apostila.titulo}" mudou para ${novoStatus}`,
          urlAcao: `/dashboard/apostilas/${id}`,
        },
      })

      // Enviar email para professor
      if (professor.email) {
        const emailHtml = templateStatusMudou(
          professor.nome,
          apostila.titulo,
          APOSTILA_STATUS[statusAnterior as ApostilaStatus].label,
          APOSTILA_STATUS[novoStatus as ApostilaStatus].label,
          descricao
        )

        await enviarEmail({
          para: professor.email,
          assunto: `Apostila "${apostila.titulo}" - Status alterado`,
          html: emailHtml,
        })
      }

      // Notificar gestor se não foi ele quem mudou
      if (userRole !== 'GESTOR') {
        const gestor = await db.user.findFirst({
          where: { role: 'GESTOR' },
        })
        if (gestor) {
          await db.notificacao.create({
            data: {
              usuarioId: gestor.id,
              apostilaId: id,
              tipo: 'STATUS_MUDOU',
              titulo: 'Apostila Atualizada',
              mensagem: `"${apostila.titulo}" mudou para ${novoStatus} por ${usuario.nome}`,
              urlAcao: `/dashboard/apostilas/${id}`,
            },
          })
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: `Status mudou de ${statusAnterior} para ${novoStatus}`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('PATCH /api/apostilas/:id/status error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar status' },
      { status: 500 }
    )
  }
}
