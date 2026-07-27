import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Mapeamento de pastas do Google Drive para cada combinação
// TODO: Preencher com os IDs reais das pastas no Google Drive
const PASTA_MAPPING: Record<string, string> = {
  // Formato: "P1|1º Ano|biologia": "FOLDER_ID"
  // Você pode obter o ID da pasta do Drive abrindo a pasta e copiando da URL
  // URL formato: https://drive.google.com/drive/folders/[FOLDER_ID]
}

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const bimestre = searchParams.get('bimestre')
    const serie = searchParams.get('serie')
    const materia = searchParams.get('materia')

    if (!bimestre || !serie || !materia) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: bimestre, serie, materia' },
        { status: 400 }
      )
    }

    const key = `${bimestre}|${serie}|${materia}`
    const driveFolder = PASTA_MAPPING[key]

    if (!driveFolder) {
      return NextResponse.json(
        {
          error: 'Pasta não configurada para esta combinação',
          message: `Configurar o ID da pasta para: ${key}`,
          configKey: key,
        },
        { status: 404 }
      )
    }

    const driveUrl = `https://drive.google.com/drive/folders/${driveFolder}?usp=sharing`

    return NextResponse.json({
      success: true,
      bimestre,
      serie,
      materia,
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
