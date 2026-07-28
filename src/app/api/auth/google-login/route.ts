import { NextResponse } from 'next/server'
import { generateCSRFState } from '@/lib/csrf'
import { GOOGLE_LOGIN_REDIRECT_URI as GOOGLE_REDIRECT_URI } from '@/lib/oauth-config'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID

export async function POST(_: any) {
  try {
    if (!GOOGLE_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Google OAuth não configurado' },
        { status: 500 }
      )
    }

    // Gerar state para CSRF
    const state = generateCSRFState()

    // Construir URL do Google OAuth
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID)
    authUrl.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', 'openid email profile')
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('prompt', 'select_account')

    // Criar response com cookie httpOnly
    const response = NextResponse.json({
      authUrl: authUrl.toString(),
    })

    response.cookies.set('login_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60, // 10 minutos
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Google login error:', error)
    return NextResponse.json(
      { error: 'Erro ao iniciar login' },
      { status: 500 }
    )
  }
}
