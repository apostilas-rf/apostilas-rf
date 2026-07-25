'use client'

import { useState } from 'react'

interface CreateTemplateModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function CreateTemplateModal({ onClose, onSuccess }: CreateTemplateModalProps) {
  const [titulo, setTitulo] = useState('')
  const [serie, setSerie] = useState<'PRIMEIRO_ANO' | 'SEGUNDO_ANO' | 'TERCEIRO_ANO' | 'CURSINHO'>('PRIMEIRO_ANO')
  const [descricao, setDescricao] = useState('')
  const [corPrimaria, setCorPrimaria] = useState('#009B60')
  const [corSecundaria, setCorSecundaria] = useState('#003333')
  const [capitulos, setCapitulos] = useState<string[]>(['Capítulo 1'])
  const [novoCapitulo, setNovoCapitulo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function adicionarCapitulo() {
    if (novoCapitulo.trim()) {
      setCapitulos([...capitulos, novoCapitulo])
      setNovoCapitulo('')
    }
  }

  function removerCapitulo(idx: number) {
    setCapitulos(capitulos.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!titulo.trim()) {
      setError('Título é obrigatório')
      return
    }

    if (capitulos.length === 0) {
      setError('Adicione pelo menos um capítulo')
      return
    }

    setLoading(true)

    try {
      const estrutura = {
        capitulos: capitulos.map((nome) => ({
          nome,
          secoes: [], // Pode ser expandido depois
        })),
        identidadeVisual: {
          corPrimaria,
          corSecundaria,
          fonte: 'Open Sans',
        },
      }

      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          titulo,
          serie,
          descricao,
          estrutura,
        }),
      })

      if (!response.ok) throw new Error('Erro ao criar template')

      alert('Template criado com sucesso!')
      onSuccess()
    } catch (err) {
      setError('Erro ao criar template. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Novo Template</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Título */}
            <div>
              <label className="label-base">Título *</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="ex: Template Padrão RF"
                className="input-base"
              />
            </div>

            {/* Série */}
            <div>
              <label className="label-base">Série *</label>
              <select
                value={serie}
                onChange={(e) => setSerie(e.target.value as any)}
                className="input-base"
              >
                <option value="PRIMEIRO_ANO">1º Ano</option>
                <option value="SEGUNDO_ANO">2º Ano</option>
                <option value="TERCEIRO_ANO">3º Ano</option>
                <option value="CURSINHO">Cursinho</option>
              </select>
            </div>

            {/* Descrição */}
            <div>
              <label className="label-base">Descrição</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva este template..."
                rows={2}
                className="input-base resize-none"
              />
            </div>

            {/* Identidade Visual */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">🎨 Identidade Visual</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-base text-sm">Cor Primária</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={corPrimaria}
                      onChange={(e) => setCorPrimaria(e.target.value)}
                      className="h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={corPrimaria}
                      onChange={(e) => setCorPrimaria(e.target.value)}
                      className="input-base flex-1 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-base text-sm">Cor Secundária</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={corSecundaria}
                      onChange={(e) => setCorSecundaria(e.target.value)}
                      className="h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={corSecundaria}
                      onChange={(e) => setCorSecundaria(e.target.value)}
                      className="input-base flex-1 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Capítulos */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">📚 Capítulos</h3>

              <div className="space-y-2 mb-3">
                {capitulos.map((cap, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{cap}</span>
                    <button
                      type="button"
                      onClick={() => removerCapitulo(idx)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={novoCapitulo}
                  onChange={(e) => setNovoCapitulo(e.target.value)}
                  placeholder="Nome do capítulo..."
                  className="input-base flex-1"
                />
                <button
                  type="button"
                  onClick={adicionarCapitulo}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded font-medium hover:bg-blue-200"
                >
                  Adicionar
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
                {error}
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-rf-green text-white rounded font-medium hover:bg-opacity-90 disabled:bg-gray-400"
              >
                {loading ? 'Criando...' : 'Criar Template'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
