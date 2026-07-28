import { google } from 'googleapis'
import { Readable } from 'stream'

const auth = new google.auth.GoogleAuth({
  projectId: process.env.GOOGLE_DRIVE_PROJECT_ID,
  credentials: {
    type: 'service_account',
    private_key_id: process.env.GOOGLE_DRIVE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL,
    client_id: process.env.GOOGLE_DRIVE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.GOOGLE_DRIVE_CLIENT_X509_CERT_URL,
  } as any,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
})

const drive = google.drive({ version: 'v3', auth })

interface UploadOptions {
  fileName: string
  fileBuffer: Buffer
  mimeType: string
  parentFolderId?: string
}

interface UploadResult {
  id: string
  name: string
  webViewLink: string
  mimeType: string
  size: string
}

/**
 * Fazer upload de arquivo para Google Drive
 */
export async function uploadToDrive(options: UploadOptions): Promise<UploadResult> {
  try {
    const { fileName, fileBuffer, mimeType, parentFolderId } = options

    const fileMetadata: any = {
      name: fileName,
    }

    if (parentFolderId) {
      fileMetadata.parents = [parentFolderId]
    }

    const media = {
      mimeType,
      body: Readable.from(fileBuffer),
    }

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, webViewLink, mimeType, size',
    })

    const file = response.data

    if (!file.id || !file.name) {
      throw new Error('Resposta inválida do Google Drive')
    }

    return {
      id: file.id,
      name: file.name,
      webViewLink: file.webViewLink || '',
      mimeType: file.mimeType || '',
      size: file.size || '0',
    }
  } catch (error) {
    console.error('Erro ao fazer upload para Google Drive:', error)
    throw new Error('Erro ao fazer upload do arquivo')
  }
}

/**
 * Baixar arquivo do Google Drive
 */
export async function downloadFromDrive(fileId: string): Promise<Buffer> {
  try {
    const response = await drive.files.get(
      {
        fileId,
        alt: 'media',
      },
      { responseType: 'stream' }
    )

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []

      response.data.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })

      response.data.on('end', () => {
        resolve(Buffer.concat(chunks))
      })

      response.data.on('error', (error: Error) => {
        reject(error)
      })
    })
  } catch (error) {
    console.error('Erro ao baixar do Google Drive:', error)
    throw new Error('Erro ao baixar o arquivo')
  }
}

/**
 * Deletar arquivo do Google Drive
 */
export async function deleteFromDrive(fileId: string): Promise<void> {
  try {
    await drive.files.delete({ fileId })
  } catch (error) {
    console.error('Erro ao deletar do Google Drive:', error)
    throw new Error('Erro ao deletar o arquivo')
  }
}

/**
 * Criar pasta no Google Drive
 */
export async function createFolder(folderName: string, parentFolderId?: string): Promise<string> {
  try {
    const fileMetadata: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }

    if (parentFolderId) {
      fileMetadata.parents = [parentFolderId]
    }

    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    })

    const folderId = response.data.id

    if (!folderId) {
      throw new Error('Não foi possível criar a pasta')
    }

    return folderId
  } catch (error) {
    console.error('Erro ao criar pasta no Google Drive:', error)
    throw new Error('Erro ao criar pasta')
  }
}

/**
 * Obter informações do arquivo
 */
export async function getFileInfo(fileId: string) {
  try {
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, webViewLink, mimeType, size, createdTime, modifiedTime',
    })

    return response.data
  } catch (error) {
    console.error('Erro ao obter info do arquivo:', error)
    throw new Error('Erro ao obter informações do arquivo')
  }
}
