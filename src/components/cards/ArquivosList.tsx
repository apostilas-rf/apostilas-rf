'use client'

import type { ApostilaArquivo } from '@/types'

interface ArquivosListProps {
  arquivos: ApostilaArquivo[]
  onDelete?: (id: string) => void
}

const tipoLabels = {
  PROFESSOR: 'Conteúdo Original',
  PROVA: 'Arquivo de Prova',
  FINAL: 'Arquivo Final',
}

export function ArquivosList({ arquivos, onDelete }: ArquivosListProps) {
  if (arquivos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum arquivo enviado ainda
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {arquivos.map((arquivo) => (
        <div
          key={arquivo.id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {arquivo.nomeOriginal}
            </p>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span>{tipoLabels[arquivo.tipo as keyof typeof tipoLabels]}</span>
              <span>
                {arquivo.tamanho
                  ? `${(Number(arquivo.tamanho) / 1024 / 1024).toFixed(2)} MB`
                  : 'Desconhecido'}
              </span>
              <span>{new Date(arquivo.criadoEm).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <a
              href={arquivo.googleDriveUrl || '#'}
              download
              className="text-rf-green hover:underline text-sm font-medium"
              title="Download"
            >
              ⬇️
            </a>
            {onDelete && (
              <button
                onClick={() => onDelete(arquivo.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
                title="Deletar"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
