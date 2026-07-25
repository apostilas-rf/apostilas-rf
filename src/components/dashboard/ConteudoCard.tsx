'use client'

import { useState } from 'react'
import { APOSTILA_STATUS } from '@/lib/constants'

interface ConteudoCardProps {
  conteudo: {
    id: string
    capitulo: string
    frente: string
    grupoConteudo: string
    tipo: string
    topicos: string[]
    enemTopico?: string
    enemEstrelas?: number
    conteudo: string
    estimadoPaginas?: number
    criadoEm: string
    usuario: {
      nome: string
    }
  }
  onDelete?: (id: string) => void
  onEdit?: (conteudo: any) => void
}

export function ConteudoCard({ conteudo, onDelete, onEdit }: ConteudoCardProps) {
  const [expanded, setExpanded] = useState(false)

  const grupoLabel = conteudo.grupoConteudo === 'NATUREZAS_MATEMATICA'
    ? 'Naturezas e Matemática'
    : 'Humanas e Linguagens'

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 cursor-pointer hover:from-gray-100 hover:to-gray-150 transition"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">
              {conteudo.capitulo}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Frente {conteudo.frente} • {grupoLabel} • {conteudo.tipo === 'CONTEUDO' ? 'Conteúdo' : 'Revisão'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">~{conteudo.estimadoPaginas} páginas</span>
            <span className="text-xl">{expanded ? '▼' : '▶'}</span>
          </div>
        </div>

        {/* Tópicos em Preview */}
        {conteudo.topicos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {conteudo.topicos.slice(0, 3).map((topico, idx) => (
              <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {topico}
              </span>
            ))}
            {conteudo.topicos.length > 3 && (
              <span className="inline-block text-xs text-gray-500 px-2 py-1">
                +{conteudo.topicos.length - 3} mais
              </span>
            )}
          </div>
        )}
      </div>

      {/* Conteúdo Expandido */}
      {expanded && (
        <div className="p-4 border-t border-gray-200 space-y-4">
          {/* Tópicos Completos */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
              Tópicos ({conteudo.topicos.length}/10)
            </p>
            <div className="flex flex-wrap gap-2">
              {conteudo.topicos.map((topico, idx) => (
                <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                  {topico}
                </span>
              ))}
            </div>
          </div>

          {/* ENEM */}
          {conteudo.enemTopico && (
            <div className="p-3 bg-amber-50 rounded border border-amber-200">
              <p className="text-sm font-medium text-amber-900">
                📌 Cai no ENEM: <span className="font-semibold">{conteudo.enemTopico}</span>
              </p>
              {conteudo.enemEstrelas && (
                <p className="text-sm text-amber-800 mt-1">
                  Frequência: {Array.from({ length: conteudo.enemEstrelas }).map(() => '⭐').join('')}
                </p>
              )}
            </div>
          )}

          {/* Conteúdo Completo */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Conteúdo</p>
            <div className="bg-gray-50 p-4 rounded border border-gray-200 max-h-96 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {conteudo.conteudo}
              </p>
            </div>
          </div>

          {/* Meta */}
          <div className="text-xs text-gray-500 pt-2 border-t">
            Criado em {new Date(conteudo.criadoEm).toLocaleDateString('pt-BR')} por {conteudo.usuario.nome}
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-4 border-t">
            {onEdit && (
              <button
                onClick={() => onEdit(conteudo)}
                className="flex-1 btn-primary text-sm"
              >
                ✏️ Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (confirm('Tem certeza que deseja deletar este capítulo?')) {
                    onDelete(conteudo.id)
                  }
                }}
                className="flex-1 btn-secondary text-sm text-red-600 hover:text-red-800"
              >
                🗑️ Deletar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
