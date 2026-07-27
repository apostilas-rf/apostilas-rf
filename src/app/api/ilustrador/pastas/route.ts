import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Get temas por matéria do admin endpoint (será substituído por banco de dados)
const PASTA_MAPPING: Record<string, string> = {}
const TEMAS_POR_MATERIA: Record<string, string[]> = {}

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

    // Se só materia, retornar lista de temas
    if (materia && !tema) {
      const temas = TEMAS_POR_MATERIA[materia] || []
      return NextResponse.json({
        success: true,
        materia,
        temas,
      })
    }

    // Se materia e tema, retornar a pasta
    if (!materia || !tema) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: materia, tema' },
        { status: 400 }
      )
    }

    const key = `${materia}|${tema}`
    const driveFolder = PASTA_MAPPING[key]

    if (!driveFolder) {
      return NextResponse.json(
        {
          error: 'Pasta não configurada para esta combinação',
          message: `Tema "${tema}" não foi configurado para ${materia}`,
          configKey: key,
        },
        { status: 404 }
      )
    }

    const driveUrl = `https://drive.google.com/drive/folders/${driveFolder}?usp=sharing`

    return NextResponse.json({
      success: true,
      materia,
      tema,
      driveFolder,
      driveUrl,
    })
  } catch (error) {
    console.error('GET /api/ilustrador/pastas error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pasta' },
      { status: 500 }
    )
  }
}
