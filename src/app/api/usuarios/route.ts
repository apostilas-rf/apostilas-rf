import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { z } from 'zod'
import type { UserRole } from '@/types'

// Security: Validate role enum
const roleSchema = z.enum(['GESTOR', 'PROFESSOR', 'DIAGRAMADOR', 'REVISOR', 'ILUSTRADOR', 'DIRECAO', 'PROPRIETARIO'] as const)

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId || userRole !== 'GESTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const roleParam = searchParams.get('role')

    // Security: Validate role parameter before using
    let role: UserRole | undefined
    if (roleParam) {
      const validation = roleSchema.safeParse(roleParam)
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid role parameter' },
          { status: 400 }
        )
      }
      role = validation.data
    }

    const usuarios = await db.user.findMany({
      where: {
        ativo: true,
        ...(role ? { role } : {}),
      },
      select: { id: true, nome: true, email: true, role: true },
      orderBy: { nome: 'asc' },
    })

    return NextResponse.json({ success: true, data: usuarios }, { status: 200 })
  } catch (error) {
    console.error('GET /api/usuarios error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 }
    )
  }
}
