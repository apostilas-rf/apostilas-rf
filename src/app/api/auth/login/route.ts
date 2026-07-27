import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createToken, verifyPassword, setSessionCookie } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar input
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { email, senha } = validation.data

    // Buscar usuário no banco
    const usuario = await db.user.findUnique({
      where: { email },
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Verificar se usuário está ativo
    if (!usuario.ativo) {
      return NextResponse.json(
        { error: 'Sua conta está pendente de aprovação. Você receberá um email quando for aprovado.' },
        { status: 403 }
      )
    }

    // Verificar senha (usuários Google OAuth não têm senha)
    if (!usuario.senha) {
      return NextResponse.json(
        { error: 'Use o login com Google' },
        { status: 401 }
      )
    }

    const senhaValida = await verifyPassword(senha, usuario.senha)
    if (!senhaValida) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Criar token
    const token = await createToken(usuario.id, usuario.email, usuario.role, usuario.nome)

    // Criar response
    const response = NextResponse.json(
      {
        success: true,
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nome: usuario.nome,
          role: usuario.role,
          ativo: usuario.ativo,
          criadoEm: usuario.criadoEm,
          atualizadoEm: usuario.atualizadoEm,
        },
      },
      { status: 200 }
    )

    // Adicionar token ao cookie
    await setSessionCookie(token)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erro ao processar login' },
      { status: 500 }
    )
  }
}
