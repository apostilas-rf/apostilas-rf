import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId || userRole !== 'PROFESSOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar apostilas onde o professor é o criador
    const apostilas = await db.apostila.findMany({
      where: { professorId: userId },
      include: {
        template: true,
        conteudosCapitulos: {
          orderBy: { criadoEm: 'asc' },
        },
        atribuicoes: {
          include: {
            usuario: {
              select: { id: true, nome: true, role: true },
            },
          },
        },
      },
      orderBy: { criadoEm: 'desc' },
    })

    return NextResponse.json(
      { success: true, data: apostilas },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/professores/apostilas error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar apostilas' },
      { status: 500 }
    )
  }
}
