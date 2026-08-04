import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // userId
    const error = searchParams.get('error')

    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(
        new URL(
          `/dashboard/conteudo?error=Google+recusou+acesso:+${encodeURIComponent(error)}`,
          process.env.NEXT_PUBLIC_APP_URL
        )
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/conteudo?error=Parâmetros+inválidos', process.env.NEXT_PUBLIC_APP_URL)
      )
    }

    const userId = state

    // Trocar authorization code por refresh token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google-drive-callback`,
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Google token exchange failed:', error)
      return NextResponse.redirect(
        new URL(
          '/dashboard/conteudo?error=Falha+ao+obter+token+do+Google',
          process.env.NEXT_PUBLIC_APP_URL
        )
      )
    }

    const tokenData = await tokenResponse.json()
    const refreshToken = tokenData.refresh_token

    if (!refreshToken) {
      console.error('Google did not return refresh_token', tokenData)
      return NextResponse.redirect(
        new URL(
          '/dashboard/conteudo?error=Google+não+retornou+refresh+token',
          process.env.NEXT_PUBLIC_APP_URL
        )
      )
    }

    // Gravar refresh token no banco
    await db.user.update({
      where: { id: userId },
      data: { driveRefreshToken: refreshToken },
    })

    console.log(`Drive authorization successful for user ${userId}`)

    return NextResponse.redirect(
      new URL('/dashboard/conteudo?success=Google+Drive+autorizado+com+sucesso', process.env.NEXT_PUBLIC_APP_URL)
    )
  } catch (error) {
    console.error('Google Drive callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/conteudo?error=Erro+ao+autorizar+Google+Drive', process.env.NEXT_PUBLIC_APP_URL)
    )
  }
}
