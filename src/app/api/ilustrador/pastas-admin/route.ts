import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { extrairFolderId, urlDaPasta, isMateriaValida } from '@/lib/ilustracao'

const ROLES_ADMIN = ['GESTOR', 'PROPRIETARIO']

async function exigirGestor() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  const userRole = headersList.get('x-user-role')

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!ROLES_ADMIN.includes(userRole || '')) {
    return NextResponse.json(
      { error: 'Acesso negado. Apenas gestor pode configurar pastas.' },
      { status: 403 }
    )
  }
  return null
}

export async function GET(_: any) {
  try {
    const negado = await exigirGestor()
    if (negado) return negado

    const pastas = await db.pastaIlustracao.findMany({
      orderBy: [{ materia: 'asc' }, { tema: 'asc' }],
    })

    return NextResponse.json({ success: true, pastas })
  } catch (error) {
    console.error('Erro ao listar pastas de ilustração:', error)
    return NextResponse.json({ error: 'Erro ao listar pastas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const negado = await exigirGestor()
    if (negado) return negado

    const body = await request.json()
    const materia = String(body.materia || '').trim()
    const tema = String(body.tema || '').trim()
    const driveFolder = String(body.driveFolder || '').trim()

    if (!materia || !tema || !driveFolder) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: materia, tema, driveFolder' },
        { status: 400 }
      )
    }

    if (!isMateriaValida(materia)) {
      return NextResponse.json({ error: 'Matéria inválida' }, { status: 400 })
    }

    const folderId = extrairFolderId(driveFolder)
    if (!folderId) {
      return NextResponse.json({ error: 'ID ou link da pasta inválido' }, { status: 400 })
    }

    // Regravar a mesma matéria+tema apenas atualiza o link, sem duplicar.
    const pasta = await db.pastaIlustracao.upsert({
      where: { materia_tema: { materia, tema } },
      update: { driveFolder: folderId, driveUrl: urlDaPasta(folderId) },
      create: { materia, tema, driveFolder: folderId, driveUrl: urlDaPasta(folderId) },
    })

    return NextResponse.json({ success: true, pasta })
  } catch (error) {
    console.error('Erro ao salvar pasta de ilustração:', error)
    return NextResponse.json({ error: 'Erro ao salvar pasta' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const negado = await exigirGestor()
    if (negado) return negado

    const id = new URL(request.url).searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Parâmetro obrigatório: id' }, { status: 400 })
    }

    await db.pastaIlustracao.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao remover pasta de ilustração:', error)
    return NextResponse.json({ error: 'Erro ao remover pasta' }, { status: 500 })
  }
}
