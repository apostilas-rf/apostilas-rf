import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { db } from '@/lib/db'

/**
 * Consulta das pastas de ilustração, para qualquer usuário autenticado.
 *
 * - só `materia`: devolve os temas cadastrados para ela
 * - `materia` + `tema`: devolve a pasta correspondente
 */
export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const materia = searchParams.get('materia')
    const tema = searchParams.get('tema')

    if (!materia) {
      return NextResponse.json(
        { error: 'Parâmetro obrigatório: materia' },
        { status: 400 }
      )
    }

    if (!tema) {
      const pastas = await db.pastaIlustracao.findMany({
        where: { materia },
        orderBy: { tema: 'asc' },
        select: { tema: true },
      })

      return NextResponse.json({
        success: true,
        materia,
        temas: pastas.map((p) => p.tema),
      })
    }

    const pasta = await db.pastaIlustracao.findUnique({
      where: { materia_tema: { materia, tema } },
    })

    if (!pasta) {
      return NextResponse.json(
        {
          error: 'Pasta não configurada para esta combinação',
          message: `O tema "${tema}" ainda não tem pasta cadastrada.`,
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      materia,
      tema,
      driveUrl: pasta.driveUrl,
    })
  } catch (error) {
    console.error('Erro ao buscar pasta de ilustração:', error)
    return NextResponse.json({ error: 'Erro ao buscar pasta' }, { status: 500 })
  }
}
