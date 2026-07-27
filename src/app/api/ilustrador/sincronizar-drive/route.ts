import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { createFolder } from '@/lib/google-drive'

const BIMESTRES = ['P1', 'P2', 'P3', 'P4']
const SERIES = ['1º Ano', '2º Ano', '3º Ano', 'Cursinho']
const MATERIAS = [
  { id: 'biologia', nome: 'Biologia' },
  { id: 'fisica', nome: 'Física' },
  { id: 'quimica', nome: 'Química' },
  { id: 'matematica', nome: 'Matemática' },
  { id: 'filosofia', nome: 'Filosofia' },
  { id: 'geografia', nome: 'Geografia' },
  { id: 'portugues', nome: 'Língua Portuguesa' },
  { id: 'literatura', nome: 'Literatura' },
  { id: 'redacao', nome: 'Redação' },
  { id: 'historia', nome: 'História' },
  { id: 'sociologia', nome: 'Sociologia' },
]

// Root folder ID where all ilustrator folders are created
// TODO: Set this to your Google Drive folder ID
const ILUSTRADOR_ROOT_FOLDER = process.env.GOOGLE_DRIVE_ILUSTRADOR_ROOT_FOLDER || ''

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    // Only GESTOR or PROPRIETARIO can sync
    if (!userId || !['GESTOR', 'PROPRIETARIO'].includes(userRole || '')) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas gestor pode sincronizar pastas.' },
        { status: 403 }
      )
    }

    if (!ILUSTRADOR_ROOT_FOLDER) {
      return NextResponse.json(
        { error: 'GOOGLE_DRIVE_ILUSTRADOR_ROOT_FOLDER não configurado no .env' },
        { status: 400 }
      )
    }

    const results = []
    const errors = []

    // For each combination of bimestre, serie, materia
    for (const bimestre of BIMESTRES) {
      for (const serie of SERIES) {
        for (const materia of MATERIAS) {
          try {
            // Check if already exists in DB
            const existing = await db.ilustradorPasta.findUnique({
              where: {
                bimestre_serie_materia: {
                  bimestre,
                  serie,
                  materia: materia.id,
                },
              },
            })

            if (existing) {
              results.push({
                bimestre,
                serie,
                materia: materia.nome,
                status: 'already_exists',
                driveFolder: existing.driveFolder,
              })
              continue
            }

            // Create folder in Google Drive
            const folderName = `${bimestre} - ${serie} - ${materia.nome}`
            const driveFolder = await createFolder(folderName, ILUSTRADOR_ROOT_FOLDER)

            // Save to database
            await db.ilustradorPasta.create({
              data: {
                bimestre,
                serie,
                materia: materia.id,
                driveFolder,
                driveUrl: `https://drive.google.com/drive/folders/${driveFolder}?usp=sharing`,
              },
            })

            results.push({
              bimestre,
              serie,
              materia: materia.nome,
              status: 'created',
              driveFolder,
            })
          } catch (error) {
            errors.push({
              bimestre,
              serie,
              materia: materia.nome,
              error: error instanceof Error ? error.message : 'Erro desconhecido',
            })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.length} pastas processadas`,
      results,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('POST /api/ilustrador/sincronizar-drive error:', error)
    return NextResponse.json(
      { error: 'Erro ao sincronizar pastas do Drive' },
      { status: 500 }
    )
  }
}

// GET: Show current status
export async function GET() {
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

    const pastas = await db.ilustradorPasta.findMany({
      orderBy: [{ bimestre: 'asc' }, { serie: 'asc' }, { materia: 'asc' }],
    })

    const total = BIMESTRES.length * SERIES.length * MATERIAS.length
    const synced = pastas.length

    return NextResponse.json({
      success: true,
      synced,
      total,
      percentage: Math.round((synced / total) * 100),
      pastas,
    })
  } catch (error) {
    console.error('GET /api/ilustrador/sincronizar-drive error:', error)
    return NextResponse.json(
      { error: 'Erro ao obter status de sincronização' },
      { status: 500 }
    )
  }
}
