import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId || userRole !== 'GESTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar todos os professores com suas apostilas
    const professores = await db.user.findMany({
      where: { role: 'PROFESSOR' },
      include: {
        apostilasEnviadas: {
          include: {
            arquivos: {
              where: { tipo: 'PROFESSOR' },
            },
          },
          orderBy: { criadoEm: 'desc' },
        },
      },
      orderBy: { nome: 'asc' },
    })

    // Mapear para o formato esperado pelo frontend
    const professoresFormatados = professores.map((prof) => ({
      ...prof,
      apostilas: prof.apostilasEnviadas,
    }))

    return NextResponse.json(
      { success: true, data: professoresFormatados },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/professores error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar professores' },
      { status: 500 }
    )
  }
}
