import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'

// Recebe os ids na ordem desejada e grava a posicao de cada um
export async function PATCH(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId || userRole !== 'GESTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ids } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Envie a lista de ids na nova ordem' },
        { status: 400 }
      )
    }

    if (ids.some((id) => typeof id !== 'string')) {
      return NextResponse.json(
        { error: 'Lista de ids inválida' },
        { status: 400 }
      )
    }

    // Confere que todos os ids existem antes de gravar qualquer coisa
    const existentes = await db.template.count({ where: { id: { in: ids } } })
    if (existentes !== ids.length) {
      return NextResponse.json(
        { error: 'Algum template da lista não existe mais' },
        { status: 404 }
      )
    }

    // Uma transacao para a lista nunca ficar com ordem parcial
    await db.$transaction(
      ids.map((id, indice) =>
        db.template.update({
          where: { id },
          data: { ordem: indice },
        })
      )
    )

    return NextResponse.json({ success: true, total: ids.length }, { status: 200 })
  } catch (error) {
    console.error('PATCH /api/templates/ordem error:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar a ordem' },
      { status: 500 }
    )
  }
}
