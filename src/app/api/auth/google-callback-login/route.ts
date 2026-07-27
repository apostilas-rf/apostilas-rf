import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createToken, setSessionCookie } from '@/lib/auth'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = 'http://localhost:3000/api/auth/google-callback-login'

interface GoogleTokenResponse {
  access_token: string
  id_token: string
  expires_in: number
}

interface GoogleUserInfo {
  sub: string
  email: string
  name: string
  picture?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      return NextResponse.redirect(new URL('/auth/login?error=invalid_request', request.url))
    }

    // Validar state
    const cookieState = request.cookies.get('login_state')?.value
    if (!cookieState || cookieState !== state) {
      return NextResponse.redirect(new URL('/auth/login?error=invalid_state', request.url))
    }

    // Trocar código por token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID || '',
        client_secret: GOOGLE_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_REDIRECT_URI,
      }).toString(),
    })

    if (!tokenResponse.ok) {
      console.error('Google token error:', await tokenResponse.text())
      return NextResponse.redirect(new URL('/auth/login?error=token_error', request.url))
    }

    const tokens = (await tokenResponse.json()) as GoogleTokenResponse

    // Obter informações do usuário
    const userInfoResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    if (!userInfoResponse.ok) {
      console.error('Google userinfo error:', await userInfoResponse.text())
      return NextResponse.redirect(new URL('/auth/login?error=userinfo_error', request.url))
    }

    const userInfo = (await userInfoResponse.json()) as GoogleUserInfo

    // Buscar usuário no banco
    const usuario = await db.user.findUnique({
      where: { email: userInfo.email },
    })

    if (!usuario) {
      return NextResponse.redirect(new URL('/auth/login?error=user_not_found', request.url))
    }

    // Verificar se usuário está ativo
    if (!usuario.ativo) {
      return NextResponse.redirect(new URL('/auth/login?error=inactive_user', request.url))
    }

    // Verificar se é usuário Google OAuth
    if (!usuario.googleId) {
      return NextResponse.redirect(new URL('/auth/login?error=not_oauth_user', request.url))
    }

    // Criar token JWT
    const token = await createToken(usuario.id, usuario.email, usuario.role, usuario.nome)

    // Criar response
    const response = NextResponse.redirect(new URL('/dashboard', request.url))

    // Adicionar token ao cookie
    await setSessionCookie(token)

    // Limpar cookies
    response.cookies.delete('login_state')

    return response
  } catch (error) {
    console.error('Google callback login error:', error)
    return NextResponse.redirect(new URL('/auth/login?error=server_error', request.url))
  }
}
