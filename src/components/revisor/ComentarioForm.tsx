'use client'

import { useState } from 'react'

interface ComentarioFormProps {
  apostilaId: string
  onSuccess: () => void
}

type CategoriaApontamento = 'ORTOGRAFIA' | 'DIAGRAMACAO' | 'SUGESTAO_MELHORIA'

export default function ComentarioForm({
  apostilaId,
  onSuccess,
}: ComentarioFormProps) {
  const [conteudo, setConteudo] = useState('')
  const [categoria, setCategoria] = useState<CategoriaApontamento>('ORTOGRAFIA')
  const [linhaAproximada, setLinhaAproximada] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const categorias = [
    { value: 'ORTOGRAFIA', label: '🔤 Erro de Ortografia' },
    { value: 'DIAGRAMACAO', label: '📐 Erro de Diagramação' },
    { value: 'SUGESTAO_MELHORIA', label: '💡 Sugestão de Melhoria' },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!conteudo.trim()) {
      setError('Descreva o apontamento')
      return
    }

    if (conteudo.length < 10) {
      setError('Descrição deve ter no mínimo 10 caracteres')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/revisores/comentarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          apostilaId,
          conteudo,
          tipo: 'REVISAO',
          categoriaApontamento: categoria,
          linhaAproximada: linhaAproximada ? parseInt(linhaAproximada) : undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao adicionar apontamento')
      }

      setSuccess(true)
      setConteudo('')
      setLinhaAproximada('')
      setCategoria('ORTOGRAFIA')

      setTimeout(() => {
        setSuccess(false)
        onSuccess()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar apontamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card-elevated">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span>➕</span> Adicionar Apontamento
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl animate-slide-in">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl animate-slide-in">
          ✓ Apontamento adicionado com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Categoria */}
        <div>
          <label className="label-base">Categoria do Apontamento *</label>
          <div className="grid grid-cols-3 gap-3">
            {categorias.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategoria(cat.value as CategoriaApontamento)}
                className={`p-3 rounded-xl border-2 font-medium text-sm transition-all duration-300 ${
                  categoria === cat.value
                    ? 'border-rf-green bg-rf-green/10 text-rf-green shadow-subtle'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Linha Aproximada */}
        <div>
          <label className="label-base">Página/Linha Aproximada (opcional)</label>
          <input
            type="number"
            value={linhaAproximada}
            onChange={(e) => setLinhaAproximada(e.target.value)}
            placeholder="Ex: 15"
            className="input-base"
            min="1"
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="label-base">Descrição do Apontamento *</label>
          <textarea
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder="Descreva o erro ou sugestão com detalhes... (mínimo 10 caracteres)"
            rows={5}
            className="input-base resize-none font-mono text-sm"
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-2">
            {conteudo.length}/1000 caracteres
          </p>
        </div>

        {/* Botão */}
        <button
          type="submit"
          disabled={loading || !conteudo.trim()}
          className="btn-primary w-full"
        >
          {loading ? '📤 Enviando...' : '➕ Adicionar Apontamento'}
        </button>
      </form>
    </div>
  )
}
