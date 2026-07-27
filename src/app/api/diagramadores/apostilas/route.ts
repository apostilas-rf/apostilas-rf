import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'

export async function GET() {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Permitir DIAGRAMADOR e GESTOR
    if (userRole !== 'DIAGRAMADOR' && userRole !== 'GESTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar apostilas atribuídas ao diagramador
    const apostilas = await db.apostila.findMany({
      where: {
        atribuicoes: {
          some: {
            usuarioId: userId,
            tarefa: 'DIAGRAMACAO',
          },
        },
      },
      include: {
        professor: {
          select: { id: true, nome: true, email: true },
        },
        arquivos: true,
        diagramacaoProgresos: {
          where: { diagramadorId: userId },
        },
        problemasRelatados: {
          where: { diagramadorId: userId },
        },
      },
      orderBy: { criadoEm: 'desc' },
    })

    return NextResponse.json(
      { success: true, data: apostilas },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/diagramadores/apostilas error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar apostilas' },
      { status: 500 }
    )
  }
}
