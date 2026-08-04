import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { conteudo, capitulo, apostilaId } = await request.json()

    if (!conteudo || !capitulo) {
      return Response.json({ error: 'Conteúdo e capítulo são obrigatórios' }, { status: 400 })
    }

    // Obter token de acesso do Google Drive
    const user = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: { driveRefreshToken: true },
    })

    if (!user?.driveRefreshToken) {
      return Response.json({ error: 'Drive não configurado. Autorize o acesso ao Drive.' }, { status: 400 })
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

    // Upload para Google Drive
    const filename = `${capitulo.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.docx`

    // Obter pasta do Drive (você precisa configurar o ID da pasta)
    const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || 'root'

    const accessToken = await refreshGoogleToken(user.driveRefreshToken)

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
    formData.append('file', new Blob([buffer]), filename)

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Drive upload error:', error)
      return Response.json({ error: 'Erro ao fazer upload no Drive', details: error }, { status: 500 })
    }

    const driveFile = await response.json()

    return Response.json({
      success: true,
      fileId: driveFile.id,
      fileName: filename,
      message: 'Conteúdo salvo no Drive com sucesso',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return Response.json({ error: 'Erro ao processar upload' }, { status: 500 })
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
