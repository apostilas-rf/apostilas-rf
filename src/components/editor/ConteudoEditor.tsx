'use client'

import { useState, useEffect } from 'react'

interface Conteudo {
  id: string
  capitulo: string
  frente: string
  tipo: string
  status: string
  conteudo: string
  estimadoPaginas: number | null
  paginasUtilizadas: number | null
  topicos: string[]
  imagensUrls: string[]
  enemTopico: string | null
  enemEstrelas: number | null
}

interface ConteudoEditorProps {
  conteudo: Conteudo
  onSave: (dados: any) => Promise<void>
  onEnviarRevisao: () => Promise<void>
  isSaving: boolean
}

export default function ConteudoEditor({
  conteudo,
  onSave,
  onEnviarRevisao,
  isSaving,
}: ConteudoEditorProps) {
  const [textoConteudo, setTextoConteudo] = useState(conteudo.conteudo)
  const [paginasUtilizadas, setPaginasUtilizadas] = useState(
    conteudo.paginasUtilizadas || 1
  )
  const [topicos, setTopicos] = useState<string[]>(conteudo.topicos || [])
  const [novoTopico, setNovoTopico] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  // Calcular páginas baseado no número de caracteres
  const charsPerPage = 2500
  const paginasCalculadas = Math.ceil(textoConteudo.length / charsPerPage)
  const limite = conteudo.estimadoPaginas || 20
  const percentualUso = (paginasCalculadas / limite) * 100

  useEffect(() => {
    setPaginasUtilizadas(paginasCalculadas)
  }, [textoConteudo])

  const handleSalvar = async () => {
    await onSave({
      conteudo: textoConteudo,
      paginasUtilizadas: paginasCalculadas,
      topicos,
      estimadoPaginas: conteudo.estimadoPaginas,
    })
    setHasChanges(false)
  }

  const handleAdicionarTopico = () => {
    if (novoTopico.trim() && topicos.length < 10) {
      setTopicos([...topicos, novoTopico])
      setNovoTopico('')
      setHasChanges(true)
    }
  }

  const handleRemoverTopico = (index: number) => {
    setTopicos(topicos.filter((_, i) => i !== index))
    setHasChanges(true)
  }

  const podeEnviarRevisao =
    textoConteudo.trim().length > 0 && paginasCalculadas <= limite

  const avisoStyle =
    percentualUso > 100
      ? 'bg-red-50 border-red-300'
      : percentualUso > 80
        ? 'bg-yellow-50 border-yellow-300'
        : 'bg-blue-50 border-blue-300'

  return (
    <div className="space-y-6">
      {/* Info do Capítulo */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-base">Capítulo</label>
          <input
            type="text"
            value={conteudo.capitulo}
            disabled
            className="input-base bg-gray-100 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="label-base">Frente</label>
          <input
            type="text"
            value={conteudo.frente}
            disabled
            className="input-base bg-gray-100 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Tópicos */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">📌 O que vamos estudar</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={novoTopico}
            onChange={(e) => setNovoTopico(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleAdicionarTopico()
            }}
            placeholder="Adicione um tópico (máx 10)"
            className="input-base flex-1"
            disabled={topicos.length >= 10}
          />
          <button
            onClick={handleAdicionarTopico}
            disabled={topicos.length >= 10 || !novoTopico.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 font-medium"
          >
            Adicionar
          </button>
        </div>
        {topicos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {topicos.map((topico, idx) => (
              <span
                key={idx}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {topico}
                <button
                  onClick={() => handleRemoverTopico(idx)}
                  className="text-blue-700 hover:text-blue-900 font-bold"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Indicador de Páginas */}
      <div className={`border rounded-lg p-4 ${avisoStyle}`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-900">📄 Páginas Utilizadas</h3>
          <span className="text-lg font-bold">
            {paginasCalculadas} / {limite}
          </span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all ${
              paginasCalculadas > limite
                ? 'bg-red-500'
                : percentualUso > 80
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentualUso, 100)}%` }}
          />
        </div>

        {paginasCalculadas > limite && (
          <p className="text-sm text-red-700 mt-2 font-medium">
            ⚠️ Atenção! Você ultrapassou o limite de páginas permitidas.
          </p>
        )}
        {percentualUso > 80 && percentualUso <= 100 && (
          <p className="text-sm text-yellow-700 mt-2">
            ⚠️ Aviso: Você está perto do limite de páginas.
          </p>
        )}
      </div>

      {/* Editor de Conteúdo */}
      <div>
        <label className="label-base">Conteúdo do Capítulo *</label>
        <textarea
          value={textoConteudo}
          onChange={(e) => {
            setTextoConteudo(e.target.value)
            setHasChanges(true)
          }}
          placeholder="Escreva o conteúdo do capítulo aqui..."
          rows={15}
          className="input-base resize-none font-mono text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          {textoConteudo.length} caracteres
        </p>
      </div>

      {/* Informações adicionais (ENEM) */}
      <div className="grid grid-cols-2 gap-4 border rounded-lg p-4">
        <div>
          <label className="label-base text-sm">Tópico ENEM (opcional)</label>
          <input
            type="text"
            defaultValue={conteudo.enemTopico || ''}
            placeholder="Ex: Cinética Química"
            className="input-base text-sm"
            onChange={(e) => setHasChanges(true)}
          />
        </div>
        <div>
          <label className="label-base text-sm">Dificuldade ENEM (opcional)</label>
          <select className="input-base text-sm">
            <option value="">Nenhuma</option>
            <option value="1">⭐ Fácil</option>
            <option value="2">⭐⭐ Intermediário</option>
            <option value="3">⭐⭐⭐ Médio</option>
            <option value="4">⭐⭐⭐⭐ Difícil</option>
            <option value="5">⭐⭐⭐⭐⭐ Muito Difícil</option>
          </select>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3 border-t pt-6">
        <button
          onClick={handleSalvar}
          disabled={!hasChanges || isSaving}
          className="flex-1 px-4 py-3 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSaving ? '💾 Salvando...' : '💾 Salvar Rascunho'}
        </button>

        <button
          onClick={onEnviarRevisao}
          disabled={!podeEnviarRevisao || isSaving || conteudo.status === 'ENVIADO_REVISAO'}
          className="flex-1 px-4 py-3 bg-green-500 text-white rounded font-medium hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          title={
            !podeEnviarRevisao
              ? 'Conteúdo vazio ou ultrapassa limite de páginas'
              : conteudo.status === 'ENVIADO_REVISAO'
                ? 'Este capítulo já foi enviado para revisão'
                : ''
          }
        >
          {isSaving ? '📤 Enviando...' : '📤 Enviar para Revisão'}
        </button>
      </div>

      {conteudo.status === 'ENVIADO_REVISAO' && (
        <div className="p-4 bg-yellow-50 border border-yellow-300 rounded">
          <p className="text-sm text-yellow-700">
            ℹ️ Este capítulo foi enviado para revisão e está aguardando aprovação.
          </p>
        </div>
      )}

      {conteudo.status === 'APROVADO' && (
        <div className="p-4 bg-green-50 border border-green-300 rounded">
          <p className="text-sm text-green-700">
            ✓ Este capítulo foi aprovado!
          </p>
        </div>
      )}

      {conteudo.status === 'REJEITADO' && (
        <div className="p-4 bg-red-50 border border-red-300 rounded">
          <p className="text-sm text-red-700">
            ✗ Este capítulo foi rejeitado. Corrija e envie novamente.
          </p>
        </div>
      )}
    </div>
  )
}
