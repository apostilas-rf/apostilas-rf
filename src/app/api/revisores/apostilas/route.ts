import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Permitir REVISOR e GESTOR
    if (userRole !== 'REVISOR' && userRole !== 'GESTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar apostilas em status "EM_DIAGRAMACAO" ou superior (prontas para revisão)
    const apostilas = await db.apostila.findMany({
      where: {
        status: {
          in: ['EM_DIAGRAMACAO', 'EM_REVISAO_FINAL', 'EM_AJUSTE'],
        },
      },
      include: {
        professor: {
          select: { id: true, nome: true, email: true },
        },
        arquivos: {
          where: { tipo: 'FINAL' },
          orderBy: { criadoEm: 'desc' },
        },
        atribuicoes: {
          where: { tarefa: 'REVISAO' },
          include: {
            usuario: {
              select: { id: true, nome: true },
            },
          },
        },
        comentarios: {
          where: { tipo: 'REVISAO' },
          include: {
            usuario: {
              select: { id: true, nome: true, role: true },
            },
          },
          orderBy: { criadoEm: 'desc' },
        },
      },
      orderBy: { criadoEm: 'desc' },
    })

    return NextResponse.json(
      { success: true, data: apostilas },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/revisores/apostilas error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar apostilas' },
      { status: 500 }
    )
  }
}
