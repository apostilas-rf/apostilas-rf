import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'

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

    const { conteudo, capitulo, apostilaId, driveFileId, materia, serie, frente } = await request.json()

    if (!conteudo || !capitulo) {
      return NextResponse.json({ error: 'Conteúdo e capítulo são obrigatórios' }, { status: 400 })
    }

    // Obter token de acesso do Google Drive
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { driveRefreshToken: true },
    })

    if (!user?.driveRefreshToken) {
      return NextResponse.json({ error: 'Drive não configurado. Autorize o acesso ao Drive.' }, { status: 400 })
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

    // Formatar nome do arquivo: P1 - 1 ANO - MATEMATICA - FRENTE A
    let filename = `${capitulo}.docx`
    if (materia && serie && frente) {
      const anoNum = SERIE_MAP[serie] || 1
      const materiaNormalized = materia.toUpperCase().replace(/\s+/g, '_')
      const frenteLetter = frente.toUpperCase()
      filename = `P${anoNum} - ${anoNum} ANO - ${materiaNormalized} - FRENTE ${frenteLetter}.docx`
    }

    // Obter pasta do Drive baseado em matéria + frente
    let DRIVE_FOLDER_ID = 'root'
    if (materia && frente) {
      const driveConfig = process.env.GOOGLE_DRIVE_FOLDERS
      if (driveConfig) {
        try {
          const folders = JSON.parse(driveConfig)
          const key = `${materia.toUpperCase().replace(/\s+/g, '_')}_${frente.toUpperCase()}`
          DRIVE_FOLDER_ID = folders[key] || 'root'
        } catch (e) {
          console.error('Erro ao parsear GOOGLE_DRIVE_FOLDERS:', e)
        }
      }
    }

    const accessToken = await refreshGoogleToken(user.driveRefreshToken)

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
