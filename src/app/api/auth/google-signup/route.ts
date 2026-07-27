import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google-callback'

export async function POST(request: NextRequest) {
  try {
    const { primaryRole, secondaryRole } = await request.json()

    if (!primaryRole) {
      return NextResponse.json(
        { error: 'Role principal é obrigatória' },
        { status: 400 }
      )
    }

    if (!GOOGLE_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Google OAuth não configurado' },
        { status: 500 }
      )
    }

    // Gerar state para CSRF protection
    const state = crypto.randomBytes(32).toString('hex')

    // Salvar state na sessão (será validado no callback)
    const response = NextResponse.json({
      authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: 'code',
        scope: 'openid email profile',
        state,
      }).toString()}`,
    })

    // Guardar state e roles no cookie para validação posterior
    response.cookies.set('signup_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60, // 10 minutos
    })

    response.cookies.set('signup_primary_role', primaryRole, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60,
    })

    if (secondaryRole) {
      response.cookies.set('signup_secondary_role', secondaryRole, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 60,
      })
    }

    return response
  } catch (error) {
    console.error('Google signup error:', error)
    return NextResponse.json(
      { error: 'Erro ao iniciar cadastro' },
      { status: 500 }
    )
  }
}
