import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { tokenDriveDaEscola } from '@/lib/drive-token'

// O editor usa isto para decidir se mostra o convite para conectar o Drive.
// Uma conexão só serve para todos os professores, então na maior parte do
// tempo isto responde { conectado: true } e nenhum botão aparece.
export async function GET() {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const token = await tokenDriveDaEscola()

    return NextResponse.json({ conectado: Boolean(token) }, { status: 200 })
  } catch (error) {
    console.error('GET /api/drive-status error:', error)
    return NextResponse.json({ error: 'Erro ao consultar status do Drive' }, { status: 500 })
  }
}
