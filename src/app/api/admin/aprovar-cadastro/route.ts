import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { enviarEmail, templateAprovacaoCadastro } from '@/lib/email'

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

    // Verificar se usuário existe e está inativo
    const user = await db.user.findUnique({
      where: { id: pendingUserId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    if (user.ativo) {
      return NextResponse.json(
        { error: 'Usuário já foi aprovado' },
        { status: 400 }
      )
    }

    // Aprovar usuário
    await db.user.update({
      where: { id: pendingUserId },
      data: {
        ativo: true,
        aprovadoEm: new Date(),
      },
    })

    // Enviar email de aprovação
    const htmlContent = templateAprovacaoCadastro(user.nome)
    await enviarEmail({
      para: user.email,
      assunto: '✅ Sua conta foi aprovada - Apostilas RF',
      html: htmlContent,
    })

    return NextResponse.json({
      success: true,
      message: 'Cadastro aprovado com sucesso',
    })
  } catch (error) {
    console.error('POST /api/admin/aprovar-cadastro error:', error)
    return NextResponse.json(
      { error: 'Erro ao aprovar cadastro' },
      { status: 500 }
    )
  }
}
