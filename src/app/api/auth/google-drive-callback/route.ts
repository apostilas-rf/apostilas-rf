import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { urlBaseApp, urlCallbackDrive, desempacotarState } from '@/lib/drive-token'

export async function GET(request: NextRequest) {
  const base = urlBaseApp()

  if (!base) {
    console.error('NEXT_PUBLIC_APP_URL ausente: não dá para montar o redirect de volta')
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_APP_URL não configurada no servidor' },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  const state = searchParams.get('state')
  const dados = state ? desempacotarState(state) : null

  // Sem state válido não dá para saber de quem é o token nem para onde voltar.
  const voltarPara = dados?.voltarPara || '/dashboard'
  const voltar = (params: string) => NextResponse.redirect(new URL(`${voltarPara}?${params}`, base))

  try {
    const code = searchParams.get('code')
    const erroGoogle = searchParams.get('error')

    if (erroGoogle) {
      console.error('Google OAuth error:', erroGoogle)
      return voltar(`driveErro=${encodeURIComponent(`Google recusou o acesso: ${erroGoogle}`)}`)
    }

    if (!dados) {
      console.error('State ausente ou inválido no callback do Drive')
      return voltar('driveErro=Sess%C3%A3o+de+autoriza%C3%A7%C3%A3o+inv%C3%A1lida')
    }

    if (!code) {
      return voltar('driveErro=Google+n%C3%A3o+devolveu+o+c%C3%B3digo')
    }

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

    const tokenData = await tokenResponse.json().catch(() => null)

    if (!tokenResponse.ok) {
      // A mensagem do Google aqui é o que realmente diz o que está errado
      // (redirect_uri_mismatch, invalid_client, invalid_grant...).
      const detalhe = tokenData?.error_description || tokenData?.error || 'erro desconhecido'
      console.error('Google token exchange failed:', tokenResponse.status, tokenData)
      return voltar(`driveErro=${encodeURIComponent(`Google recusou a troca do código: ${detalhe}`)}`)
    }

    if (!tokenData?.refresh_token) {
      console.error('Google não devolveu refresh_token:', tokenData)
      return voltar(
        'driveErro=' +
          encodeURIComponent(
            'O Google não devolveu o token permanente. Remova o acesso do app em ' +
              'myaccount.google.com/permissions e tente conectar de novo.'
          )
      )
    }

    await db.user.update({
      where: { id: dados.userId },
      data: { driveRefreshToken: tokenData.refresh_token },
    })

    console.log('Drive conectado pelo usuário', dados.userId)

    return voltar('driveOk=1')
  } catch (error) {
    console.error('Google Drive callback error:', error)
    return voltar('driveErro=Erro+inesperado+ao+conectar+o+Drive')
  }
}
