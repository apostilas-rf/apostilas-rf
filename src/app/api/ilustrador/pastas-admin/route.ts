import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// In-memory storage (será substituído por banco de dados depois)
const pastas: Record<string, string> = {}

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId || !['GESTOR', 'PROPRIETARIO'].includes(userRole || '')) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas gestor pode gerenciar pastas.' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      pastas,
    })
  } catch (error) {
    console.error('GET /api/ilustrador/pastas-admin error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pastas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId || !['GESTOR', 'PROPRIETARIO'].includes(userRole || '')) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { bimestre, serie, materia, driveFolder } = body

    if (!bimestre || !serie || !materia || !driveFolder) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: bimestre, serie, materia, driveFolder' },
        { status: 400 }
      )
    }

    const key = `${bimestre}|${serie}|${materia}`
    pastas[key] = driveFolder

    return NextResponse.json({
      success: true,
      message: 'Pasta configurada com sucesso',
      key,
      driveFolder,
    })
  } catch (error) {
    console.error('POST /api/ilustrador/pastas-admin error:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar pasta' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId || !['GESTOR', 'PROPRIETARIO'].includes(userRole || '')) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { error: 'Parâmetro obrigatório: key' },
        { status: 400 }
      )
    }

    delete pastas[key]

    return NextResponse.json({
      success: true,
      message: 'Pasta removida com sucesso',
    })
  } catch (error) {
    console.error('DELETE /api/ilustrador/pastas-admin error:', error)
    return NextResponse.json(
      { error: 'Erro ao remover pasta' },
      { status: 500 }
    )
  }
}
