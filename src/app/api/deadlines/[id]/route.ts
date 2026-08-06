import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { statusDaEtapa } from '@/lib/etapas'

// Marcar a etapa como concluída (ou reabrir). Quem é responsável pela etapa
// também pode, senão todo "terminei" teria de passar pelo gestor.
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

    const prazo = await db.deadline.findUnique({ where: { id } })
    if (!prazo) {
      return NextResponse.json({ error: 'Prazo não encontrado' }, { status: 404 })
    }

    if (userRole !== 'GESTOR' && prazo.responsavelId !== userId) {
      return NextResponse.json(
        { error: 'Só o gestor ou o responsável pela etapa pode alterar' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const concluido = Boolean(body?.concluido)

    const atualizado = await db.deadline.update({
      where: { id },
      data: { concluido, concluidoEm: concluido ? new Date() : null },
      include: {
        responsavel: { select: { id: true, nome: true, email: true } },
        apostila: { select: { id: true, titulo: true, materia: true, serie: true } },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          ...atualizado,
          statusPrazo: statusDaEtapa(atualizado.dataPrazo, atualizado.concluido),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('PATCH /api/deadlines/[id] error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar prazo' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId || userRole !== 'GESTOR') {
      return NextResponse.json(
        { error: 'Apenas o gestor pode remover prazos' },
        { status: 403 }
      )
    }

    await db.deadline.delete({ where: { id } })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/deadlines/[id] error:', error)
    return NextResponse.json({ error: 'Erro ao remover prazo' }, { status: 500 })
  }
}
