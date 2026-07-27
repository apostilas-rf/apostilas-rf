import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('foto') as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Arquivo deve ser uma imagem' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Arquivo muito grande (máximo 5MB)' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    await db.fotoPerfil.upsert({
      where: { usuarioId: userId },
      update: {
        dataUrl,
        nomeArquivo: file.name,
        tipo: file.type,
        tamanho: file.size,
      },
      create: {
        usuarioId: userId,
        dataUrl,
        nomeArquivo: file.name,
        tipo: file.type,
        tamanho: file.size,
      },
    })

    return NextResponse.json({ success: true, foto: dataUrl })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Erro ao fazer upload de foto:', msg)
    return NextResponse.json({ error: 'Erro ao fazer upload de foto', details: msg }, { status: 500 })
  }
}

export async function GET() {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const foto = await db.fotoPerfil.findUnique({
      where: { usuarioId: userId },
      select: { dataUrl: true, nomeArquivo: true, tipo: true },
    })

    if (!foto) {
      return NextResponse.json({ success: true, foto: null })
    }

    return NextResponse.json({ success: true, foto })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: 'Erro ao obter foto', details: msg }, { status: 500 })
  }
}
