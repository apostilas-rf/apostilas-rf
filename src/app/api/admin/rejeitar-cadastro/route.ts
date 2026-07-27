import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId || userRole !== 'GESTOR') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { userId: pendingUserId } = await request.json()

    if (!pendingUserId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se usuário existe
    const user = await db.user.findUnique({
      where: { id: pendingUserId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Deletar usuário (cascata remove roles adicionais)
    await db.user.delete({
      where: { id: pendingUserId },
    })

    // TODO: Enviar email de rejeição

    return NextResponse.json({
      success: true,
      message: 'Cadastro rejeitado e usuário deletado',
    })
  } catch (error) {
    console.error('POST /api/admin/rejeitar-cadastro error:', error)
    return NextResponse.json(
      { error: 'Erro ao rejeitar cadastro' },
      { status: 500 }
    )
  }
}
