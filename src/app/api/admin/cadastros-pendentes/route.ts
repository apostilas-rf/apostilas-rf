import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    // Apenas GESTOR pode ver cadastros pendentes
    if (!userId || userRole !== 'GESTOR') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const usuarios = await db.user.findMany({
      where: {
        ativo: false, // Apenas inativos (pendentes)
      },
      select: {
        id: true,
        email: true,
        nome: true,
        role: true,
        rolesAdicionais: {
          select: { role: true },
        },
        criadoEm: true,
      },
      orderBy: {
        criadoEm: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      data: usuarios,
    })
  } catch (error) {
    console.error('GET /api/admin/cadastros-pendentes error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar cadastros pendentes' },
      { status: 500 }
    )
  }
}
