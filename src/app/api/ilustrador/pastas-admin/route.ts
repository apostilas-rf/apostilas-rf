import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// In-memory storage (será substituído por banco de dados depois)
// Formato: { "materia|tema": "driveFolder" }
const pastas: Record<string, string> = {}

// Temas por matéria: { "materia": ["tema1", "tema2"] }
const temasPorMateria: Record<string, string[]> = {}

const MATERIAS = [
  { id: 'biologia', nome: 'Biologia' },
  { id: 'fisica', nome: 'Física' },
  { id: 'quimica', nome: 'Química' },
  { id: 'matematica', nome: 'Matemática' },
  { id: 'filosofia', nome: 'Filosofia' },
  { id: 'geografia', nome: 'Geografia' },
  { id: 'historia', nome: 'História' },
  { id: 'sociologia', nome: 'Sociologia' },
  { id: 'portugues', nome: 'Língua Portuguesa' },
  { id: 'literatura', nome: 'Literatura' },
  { id: 'redacao', nome: 'Redação' },
]

export async function GET(_: any) {
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

    return NextResponse.json({
      success: true,
      pastas,
      temasPorMateria,
    })
  } catch (error) {
    console.error('GET /api/ilustrador/pastas-admin error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pastas' },
      { status: 500 }
    )
  }
}

// Adicionar tema a uma matéria
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
    const { materia, tema, driveFolder } = body

    if (!materia || !tema || !driveFolder) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: materia, tema, driveFolder' },
        { status: 400 }
      )
    }

    // Validar matéria
    if (!MATERIAS.find((m) => m.id === materia)) {
      return NextResponse.json(
        { error: 'Matéria inválida' },
        { status: 400 }
      )
    }

    // Adicionar tema à lista se não existir
    if (!temasPorMateria[materia]) {
      temasPorMateria[materia] = []
    }

    if (!temasPorMateria[materia].includes(tema)) {
      temasPorMateria[materia].push(tema)
      temasPorMateria[materia].sort()
    }

    // Salvar pasta
    const key = `${materia}|${tema}`
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

// Deletar tema/pasta
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
