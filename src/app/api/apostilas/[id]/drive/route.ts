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

    const arquivo = await db.apostilaArquivo.findFirst({
      where: {
        apostilaId: id,
        tipo: 'FINAL',
        googleDriveId: { not: null },
      },
      select: { googleDriveId: true },
    })

    if (!arquivo || !arquivo.googleDriveId) {
      return NextResponse.json({ driveId: null }, { status: 200 })
    }

    return NextResponse.json({ driveId: arquivo.googleDriveId }, { status: 200 })
  } catch (error) {
    console.error('GET /api/apostilas/[id]/drive error:', error)
    return NextResponse.json({ error: 'Erro ao buscar Drive ID' }, { status: 500 })
  }
}
