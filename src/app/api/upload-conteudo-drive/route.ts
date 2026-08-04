import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { chaveMateria, resolverPasta, nomeArquivo } from '@/lib/drive-pastas'
import { tokenDriveDaEscola } from '@/lib/drive-token'

// Mapear série para número
const SERIE_MAP: Record<string, number> = {
  PRIMEIRO_ANO: 1,
  SEGUNDO_ANO: 2,
  TERCEIRO_ANO: 3,
  CURSINHO: 0,
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { conteudo, capitulo, apostilaId, driveFileId, materia, serie, frente, anoEscolar } = await request.json()

    if (!conteudo || !capitulo) {
      return NextResponse.json({ error: 'Conteúdo e capítulo são obrigatórios' }, { status: 400 })
    }

    // Token único da escola: os arquivos vão para as pastas institucionais,
    // não para o Drive pessoal de quem está escrevendo o capítulo.
    const refreshToken = await tokenDriveDaEscola()

    if (!refreshToken) {
      return NextResponse.json(
        {
          error:
            'O Google Drive ainda não foi conectado. Peça ao gestor para clicar em ' +
            '"Conectar Google Drive" uma vez — depois disso vale para todos os professores.',
        },
        { status: 400 }
      )
    }

    // Gerar documento Word
    const paragraphs: Paragraph[] = []

    // Título
    paragraphs.push(
      new Paragraph({
        text: capitulo,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
      })
    )

    // Conteúdo (parseando markdown simples)
    const lines = conteudo.split('\n')
    for (const line of lines) {
      if (line.trim()) {
        paragraphs.push(
          new Paragraph({
            text: line,
            spacing: { after: 100 },
          })
        )
      }
    }

    const doc = new Document({
      sections: [
        {
          children: paragraphs,
        },
      ],
    })

    // Converter documento para bytes
    const buffer = await Packer.toBuffer(doc)
    const fileBlob = new Blob([Buffer.from(buffer)])

    // Resolver a pasta ANTES de subir. Sem pasta mapeada, falha explicitamente:
    // cair em 'root' fazia o arquivo sumir na raiz do Drive sem nenhum aviso.
    if (!materia) {
      return NextResponse.json({ error: 'Matéria é obrigatória para escolher a pasta' }, { status: 400 })
    }

    // Distingue "variável ausente no deploy" de "matéria sem pasta mapeada":
    // antes as duas davam a mesma mensagem e escondiam qual era o caso.
    if (!process.env.GOOGLE_DRIVE_FOLDERS) {
      return NextResponse.json(
        {
          error:
            'A variável GOOGLE_DRIVE_FOLDERS não está definida no servidor. ' +
            'Copie o valor do .env.local para as variáveis de ambiente da Vercel e refaça o deploy.',
        },
        { status: 400 }
      )
    }

    const pasta = resolverPasta(materia, frente)
    if (!pasta) {
      return NextResponse.json(
        {
          error: `Nenhuma pasta do Drive configurada para "${materia}"${frente ? ` frente ${frente}` : ''}. ` +
            `Esperado GOOGLE_DRIVE_FOLDERS com a chave "${chaveMateria(materia)}"` +
            `${frente ? ` ou "${chaveMateria(materia)}_${frente.toUpperCase()}"` : ''}.`,
        },
        { status: 400 }
      )
    }
    const DRIVE_FOLDER_ID = pasta.folderId

    // Nome do arquivo: P1 - 1 ANO - MATEMATICA - FRENTE A
    // O "P" é o bimestre; o "ANO" vem da série da apostila.
    const anoNum = SERIE_MAP[serie] ?? 1
    const filename = nomeArquivo(materia, anoNum, anoEscolar, pasta, frente)

    const accessToken = await refreshGoogleToken(refreshToken)

    let driveFile
    let uploadUrl: string

    if (driveFileId) {
      // Atualizar arquivo existente
      uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${driveFileId}?uploadType=media`
      const response = await fetch(uploadUrl, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
        body: fileBlob,
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('Drive update error:', error)
        return NextResponse.json({ error: 'Erro ao atualizar arquivo no Drive', details: error }, { status: 500 })
      }

      driveFile = await response.json()
      return NextResponse.json({
        success: true,
        fileId: driveFileId,
        fileName: filename,
        message: 'Conteúdo atualizado no Drive com sucesso',
      })
    } else {
      // Criar novo arquivo
      const formData = new FormData()
      formData.append(
        'metadata',
        new Blob(
          [
            JSON.stringify({
              name: filename,
              mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              parents: [DRIVE_FOLDER_ID],
            }),
          ],
          { type: 'application/json' }
        )
      )
      formData.append('file', fileBlob, filename)

      uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart'
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('Drive upload error:', error)
        return NextResponse.json({ error: 'Erro ao fazer upload no Drive', details: error }, { status: 500 })
      }

      driveFile = await response.json()
      return NextResponse.json({
        success: true,
        fileId: driveFile.id,
        fileName: filename,
        message: 'Conteúdo salvo no Drive com sucesso',
      })
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Erro ao processar upload' }, { status: 500 })
  }
}

async function refreshGoogleToken(refreshToken: string): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    throw new Error('Falha ao renovar token do Google')
  }

  const data = await response.json()
  return data.access_token
}
