import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import type { ArquivoTipo } from '@/types'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    console.log('POST /api/upload', { userId, userRole })

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const apostilaId = formData.get('apostilaId') as string
    const tipo = formData.get('tipo') as ArquivoTipo
    const file = formData.get('file') as File
    const linkDrive = formData.get('linkDrive') as string
    const nomeArquivo = formData.get('nomeArquivo') as string

    if (!apostilaId || !tipo) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    // Validar se tem arquivo ou link
    if (!file && !linkDrive) {
      return NextResponse.json({ error: 'Envie um arquivo ou adicione um link' }, { status: 400 })
    }

    // Se tem arquivo, validar
    if (file) {
      console.log('Upload de arquivo recebido:', { apostilaId, tipo, fileName: file.name })

      // Validar tamanho
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Arquivo muito grande. Máximo: 50MB` },
          { status: 400 }
        )
      }

      // Validar tipo de arquivo
      const tiposPermitidos: Record<ArquivoTipo, string[]> = {
        PROFESSOR: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        PROVA: ['application/pdf'],
        FINAL: ['application/pdf'],
      }

      if (!tiposPermitidos[tipo]?.includes(file.type)) {
        return NextResponse.json(
          { error: `Tipo de arquivo inválido para ${tipo}. Aceitos: ${tiposPermitidos[tipo]?.join(', ')}` },
          { status: 400 }
        )
      }
    }

    // Se tem link, validar
    if (linkDrive) {
      console.log('Link de Drive recebido:', { apostilaId, tipo, nomeArquivo })

      if (!linkDrive.includes('drive.google.com')) {
        return NextResponse.json(
          { error: 'Link inválido. Use um link do Google Drive' },
          { status: 400 }
        )
      }
    }

    // Buscar apostila
    const apostila = await db.apostila.findUnique({ where: { id: apostilaId } })
    if (!apostila) {
      return NextResponse.json({ error: 'Apostila não encontrada' }, { status: 404 })
    }

    // Validar permissões
    const podeUpload =
      (tipo === 'PROFESSOR' && apostila.professorId === userId) ||
      (tipo === 'PROVA' && ['DIAGRAMADOR', 'ILUSTRADOR', 'GESTOR'].includes(userRole || '')) ||
      (tipo === 'FINAL' && ['EDITOR', 'GESTOR'].includes(userRole || ''))

    if (!podeUpload) {
      return NextResponse.json(
        { error: 'Permissão negada para upload deste tipo de arquivo' },
        { status: 403 }
      )
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const nomeServidor = `${apostilaId}_${tipo}_${timestamp}_${file.name}`

    // Gerar ID único
    const googleDriveId = file ? `local_${timestamp}` : `drive_${timestamp}`
    const nomeOriginalFinal = file ? file.name : (nomeArquivo || 'Arquivo do Drive')
    const googleDriveUrlFinal = file
      ? `/api/download/${apostilaId}/${googleDriveId}_${file.name}`
      : linkDrive
    const mimeTypeFinal = file ? file.type : 'link/google-drive'
    const tamanhoFinal = file ? BigInt(file.size) : BigInt(0)

    // Salvar referência no banco
    const arquivo = await db.apostilaArquivo.create({
      data: {
        apostilaId,
        tipo,
        nomeOriginal: nomeOriginalFinal,
        nomeServidor: `${apostilaId}_${tipo}_${timestamp}`,
        usuarioId: userId,
        tamanho: tamanhoFinal,
        mimeType: mimeTypeFinal,
        googleDriveId,
        googleDriveUrl: googleDriveUrlFinal,
      },
    })

    // Registrar no histórico
    await db.apostilaHistory.create({
      data: {
        apostilaId,
        usuarioId: userId,
        statusNovo: apostila.status,
        acao: 'ARQUIVO_ENVIADO',
        descricao: `Arquivo ${tipo} enviado: ${file.name}`,
      },
    })

    console.log('Arquivo salvo:', arquivo.id)

    return NextResponse.json(
      {
        success: true,
        data: {
          id: arquivo.id,
          nomeOriginal: arquivo.nomeOriginal,
          tipo: arquivo.tipo,
          tamanho: arquivo.tamanho?.toString(),
          criadoEm: arquivo.criadoEm,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer upload do arquivo' },
      { status: 500 }
    )
  }
}
