import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google-callback'

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
      return NextResponse.redirect(new URL('/auth/signup?error=invalid_request', request.url))
    }

    // Validar state
    const cookieState = request.cookies.get('signup_state')?.value
    if (!cookieState || cookieState !== state) {
      return NextResponse.redirect(new URL('/auth/signup?error=invalid_state', request.url))
    }

    // Obter roles dos cookies
    const primaryRole = request.cookies.get('signup_primary_role')?.value
    const secondaryRole = request.cookies.get('signup_secondary_role')?.value

    if (!primaryRole) {
      return NextResponse.redirect(new URL('/auth/signup?error=missing_role', request.url))
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
      return NextResponse.redirect(new URL('/auth/signup?error=token_error', request.url))
    }

    const tokens = (await tokenResponse.json()) as GoogleTokenResponse

    // Obter informações do usuário
    const userInfoResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    if (!userInfoResponse.ok) {
      console.error('Google userinfo error:', await userInfoResponse.text())
      return NextResponse.redirect(new URL('/auth/signup?error=userinfo_error', request.url))
    }

    const userInfo = (await userInfoResponse.json()) as GoogleUserInfo

    // Verificar se usuário já existe
    let user = await db.user.findUnique({
      where: { email: userInfo.email },
    })

    if (user) {
      // Usuário já existe, redirecionar para login
      return NextResponse.redirect(new URL('/auth/login?error=user_exists', request.url))
    }

    // Criar novo usuário (INATIVO - precisa aprovação)
    user = await db.user.create({
      data: {
        email: userInfo.email,
        nome: userInfo.name,
        googleId: userInfo.sub,
        role: primaryRole as any, // Role principal
        senha: null, // Sem senha para Google OAuth
        ativo: false, // Precisa aprovação
      },
    })

    // Adicionar role secundária se houver
    if (secondaryRole && secondaryRole !== primaryRole) {
      await db.userRole.create({
        data: {
          usuarioId: user.id,
          role: secondaryRole as any,
        },
      })
    }

    // Limpar cookies
    const response = NextResponse.redirect(new URL('/auth/signup-pending', request.url))
    response.cookies.delete('signup_state')
    response.cookies.delete('signup_primary_role')
    response.cookies.delete('signup_secondary_role')

    return response
  } catch (error) {
    console.error('Google callback error:', error)
    return NextResponse.redirect(new URL('/auth/signup?error=server_error', request.url))
  }
}
