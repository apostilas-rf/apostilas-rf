import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google-drive-callback`

    if (!clientId || !redirectUri) {
      console.error('GOOGLE_CLIENT_ID ou NEXT_PUBLIC_APP_URL não configurados')
      return NextResponse.json(
        { error: 'Configuração do Google incompleta' },
        { status: 500 }
      )
    }

    // Escopos para acessar Google Drive (leitura e escrita)
    const scopes = [
      'https://www.googleapis.com/auth/drive.file', // Acesso apenas aos arquivos criados pela app
    ]

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline', // Necessário para obter refresh token
      prompt: 'consent', // Força o usuário a ver a tela de consentimento
      state: userId, // Passa o userId para verificar na volta
    })

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

    return NextResponse.json({ authUrl }, { status: 200 })
  } catch (error) {
    console.error('Google Drive auth error:', error)
    return NextResponse.json(
      { error: 'Erro ao iniciar autorização do Google Drive' },
      { status: 500 }
    )
  }
}
