import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Tenta buscar o driveFileId de ConteudoCapitulo (onde fica armazenado)
    const conteudo = await db.conteudoCapitulo.findFirst({
      where: {
        apostilaId: id,
        driveFileId: { not: null },
      },
      select: { driveFileId: true },
      orderBy: { id: 'desc' },
    })

    if (!conteudo || !conteudo.driveFileId) {
      // Fallback: tenta ApostilaArquivo
      const arquivo = await db.apostilaArquivo.findFirst({
        where: {
          apostilaId: id,
          googleDriveId: { not: null },
        },
        select: { googleDriveId: true },
      })
      if (!arquivo) {
        return NextResponse.json({ driveId: null }, { status: 200 })
      }
      return NextResponse.json({ driveId: arquivo.googleDriveId }, { status: 200 })
    }

    return NextResponse.json({ driveId: conteudo.driveFileId }, { status: 200 })
  } catch (error) {
    console.error('GET /api/apostilas/[id]/drive error:', error)
    return NextResponse.json({ error: 'Erro ao buscar Drive ID' }, { status: 500 })
  }
}
