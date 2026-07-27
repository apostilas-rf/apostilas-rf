import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const apostilaId = formData.get('apostilaId') as string

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não fornecido' }, { status: 400 })
    }

    if (!apostilaId) {
      return NextResponse.json({ error: 'Apostila ID não fornecido' }, { status: 400 })
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Apenas arquivos de imagem são permitidos' }, { status: 400 })
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Imagem deve ter menos de 5MB' }, { status: 400 })
    }

    // Converter imagem para base64
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const imageUrl = `data:${file.type};base64,${base64}`

    return NextResponse.json(
      {
        success: true,
        imageUrl,
        fileName: file.name,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('POST /api/upload-imagem error:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer upload da imagem' },
      { status: 500 }
    )
  }
}
