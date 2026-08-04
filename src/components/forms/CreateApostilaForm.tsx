'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SERIES } from '@/lib/constants'
import { MATERIAS } from '@/lib/materias'

interface CreateApostilaFormProps {
  onSuccess?: () => void
}

export function CreateApostilaForm({ onSuccess }: CreateApostilaFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    titulo: '',
    materia: '',
    serie: 'PRIMEIRO_ANO' as const,
    bimestre: 'P1' as const,
    observacoes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/apostilas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Erro ao criar apostila')
        return
      }

      const data = await response.json()
      console.log('Apostila criada:', data)

      // Limpar form
      setFormData({
        titulo: '',
        materia: '',
        serie: 'PRIMEIRO_ANO',
        bimestre: 'P1',
        observacoes: '',
      })

      // Callback
      onSuccess?.()

      // Redirecionar
      setTimeout(() => {
        router.push(`/dashboard/apostilas/${data.data.id}`)
      }, 500)
    } catch (err) {
      setError('Erro na conexão. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label-base">Título da Apostila</label>
        <input
          type="text"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          placeholder="Ex: Apostila de Português - Unidade 1"
          className="input-base"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label-base">Matéria</label>
          <select
            name="materia"
            value={formData.materia}
            onChange={handleChange}
            className="input-base"
            required
          >
            <option value="">Selecione a matéria</option>
            {MATERIAS.map((m) => (
              <option key={m.nome} value={m.nome}>
                {m.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-base">Série</label>
          <select
            name="serie"
            value={formData.serie}
            onChange={handleChange}
            className="input-base"
          >
            {Object.entries(SERIES).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-base">Bimestre</label>
          <select
            name="bimestre"
            value={formData.bimestre}
            onChange={handleChange}
            className="input-base"
          >
            <option value="P1">P1</option>
            <option value="P2">P2</option>
            <option value="P3">P3</option>
            <option value="P4">P4</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label-base">Observações (Opcional)</label>
        <textarea
          name="observacoes"
          value={formData.observacoes}
          onChange={handleChange}
          placeholder="Observações adicionais..."
          rows={3}
          className="input-base"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? 'Criando...' : 'Criar Apostila'}
      </button>
    </form>
  )
}
