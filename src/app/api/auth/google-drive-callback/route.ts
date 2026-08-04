import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { urlBaseApp, urlCallbackDrive } from '@/lib/drive-token'

export async function GET(request: NextRequest) {
  const base = urlBaseApp()

  if (!base) {
    console.error('NEXT_PUBLIC_APP_URL ausente: não dá para montar o redirect de volta')
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_APP_URL não configurada no servidor' },
      { status: 500 }
    )
  }

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
          base
        )
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/conteudo?error=Parâmetros+inválidos', base)
      )
    }

    const userId = state

    // Validar o state para conformidade com OAuth 2.0 security policy
    // O state deve ser válido (não vazio e não tampering)
    if (typeof userId !== 'string' || userId.length === 0) {
      console.error('Invalid state parameter')
      return NextResponse.redirect(
        new URL('/dashboard/conteudo?error=Estado+inválido', base)
      )
    }

    // Trocar authorization code por refresh token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: urlCallbackDrive() || '',
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Google token exchange failed:', error)
      return NextResponse.redirect(
        new URL(
          '/dashboard/conteudo?error=Falha+ao+obter+token+do+Google',
          base
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
          base
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
      new URL('/dashboard/conteudo?success=Google+Drive+autorizado+com+sucesso', base)
    )
  } catch (error) {
    console.error('Google Drive callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/conteudo?error=Erro+ao+autorizar+Google+Drive', base)
    )
  }
}
