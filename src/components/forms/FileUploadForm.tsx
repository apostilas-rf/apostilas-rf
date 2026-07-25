'use client'

import { useState, useRef } from 'react'
import type { ArquivoTipo } from '@/types'

interface FileUploadFormProps {
  apostilaId: string
  tipo: ArquivoTipo
  onSuccess?: () => void
}

const tipoLabels: Record<ArquivoTipo, string> = {
  PROFESSOR: 'Conteúdo Original (Word)',
  PROVA: 'Arquivo de Prova (PDF)',
  FINAL: 'Arquivo Final (PDF)',
}

const tipoAceitos: Record<ArquivoTipo, string> = {
  PROFESSOR: '.doc,.docx',
  PROVA: '.pdf',
  FINAL: '.pdf',
}

export function FileUploadForm({ apostilaId, tipo, onSuccess }: FileUploadFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [method, setMethod] = useState<'file' | 'link'>('file')
  const [linkDrive, setLinkDrive] = useState('')
  const [nomeArquivo, setNomeArquivo] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  async function handleFile(file: File) {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Validar tipo de arquivo
      const tiposPermitidos: Record<ArquivoTipo, string[]> = {
        PROFESSOR: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        PROVA: ['application/pdf'],
        FINAL: ['application/pdf'],
      }

      if (!tiposPermitidos[tipo]?.includes(file.type)) {
        setError(`Tipo de arquivo inválido. Aceitos: ${tiposPermitidos[tipo]?.join(', ')}`)
        setLoading(false)
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('apostilaId', apostilaId)
      formData.append('tipo', tipo)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Erro ao fazer upload')
        return
      }

      setSuccess(`Arquivo "${file.name}" enviado com sucesso!`)

      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      setTimeout(() => {
        onSuccess?.()
      }, 1000)
    } catch (err) {
      setError('Erro na conexão. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleLinkSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('apostilaId', apostilaId)
      formData.append('tipo', tipo)
      formData.append('linkDrive', linkDrive)
      formData.append('nomeArquivo', nomeArquivo)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Erro ao adicionar link')
        return
      }

      setSuccess('Link adicionado com sucesso!')
      setLinkDrive('')
      setNomeArquivo('')

      setTimeout(() => {
        onSuccess?.()
      }, 1000)
    } catch (err) {
      setError('Erro na conexão. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="label-base">{tipoLabels[tipo]}</label>

        {/* Seletor de método */}
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="method"
              value="file"
              checked={method === 'file'}
              onChange={(e) => setMethod(e.target.value as 'file' | 'link')}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enviar arquivo</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="method"
              value="link"
              checked={method === 'link'}
              onChange={(e) => setMethod(e.target.value as 'file' | 'link')}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Link do Drive</span>
          </label>
        </div>

        {/* Opção 1: Upload de arquivo */}
        {method === 'file' && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-rf-green bg-green-50'
                : 'border-gray-300 dark:border-gray-600 hover:border-rf-green'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={tipoAceitos[tipo]}
              onChange={handleChange}
              className="hidden"
            />
            <p className="text-gray-600 dark:text-gray-400 font-medium">Arrastar arquivo aqui ou clicar</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Formato: {tipoAceitos[tipo]} (máximo 50MB)
            </p>
          </div>
        )}

        {/* Opção 2: Link do Drive */}
        {method === 'link' && (
          <form onSubmit={handleLinkSubmit} className="space-y-3">
            <div>
              <label className="label-base text-sm">Link do Google Drive *</label>
              <input
                type="url"
                value={linkDrive}
                onChange={(e) => setLinkDrive(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="input-base"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Compartilhe o arquivo e cole o link aqui
              </p>
            </div>

            <div>
              <label className="label-base text-sm">Nome do Arquivo (opcional)</label>
              <input
                type="text"
                value={nomeArquivo}
                onChange={(e) => setNomeArquivo(e.target.value)}
                placeholder="ex: Apostila_Geografia"
                className="input-base"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !linkDrive}
              className="btn-primary w-full"
            >
              {loading ? 'Adicionando...' : 'Adicionar Link'}
            </button>
          </form>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✓ {success}
        </div>
      )}
    </div>
  )
}
