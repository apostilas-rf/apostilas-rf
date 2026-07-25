import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const headersList = headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')
    const userName = headersList.get('x-user-name')
    const userEmail = headersList.get('x-user-email')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar usuário completo do banco
    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        foto: true,
      },
    })

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: usuario.id,
          role: usuario.role,
          nome: usuario.nome,
          email: usuario.email,
          foto: usuario.foto,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/auth/me error:', error)
    return NextResponse.json(
      { error: 'Erro ao obter usuário' },
      { status: 500 }
    )
  }
}
