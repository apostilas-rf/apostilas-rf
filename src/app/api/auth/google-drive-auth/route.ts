import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { urlCallbackDrive, empacotarState } from '@/lib/drive-token'

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Página de onde o usuário clicou, para devolvê-lo exatamente ali.
    const voltarPara = new URL(request.url).searchParams.get('voltarPara') || '/dashboard'

    const clientId = process.env.GOOGLE_CLIENT_ID
    const redirectUri = urlCallbackDrive()

    if (!clientId) {
      console.error('GOOGLE_CLIENT_ID não configurado')
      return NextResponse.json(
        { error: 'GOOGLE_CLIENT_ID não configurado no servidor' },
        { status: 500 }
      )
    }

    // Sem isso o redirect_uri sai como "undefined/api/..." e o Google
    // responde 400 invalid_request, sem dizer o motivo.
    if (!redirectUri) {
      console.error('NEXT_PUBLIC_APP_URL ausente ou inválida:', process.env.NEXT_PUBLIC_APP_URL)
      return NextResponse.json(
        {
          error:
            'NEXT_PUBLIC_APP_URL não está definida no servidor. ' +
            'Defina como https://apostilas-rf.vercel.app nas variáveis de ambiente da Vercel.',
        },
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
      prompt: 'consent', // Sem isto o Google não reenvia o refresh_token
      state: empacotarState(userId, voltarPara),
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
