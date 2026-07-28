'use client'

import { useState, useEffect } from 'react'
import { MATERIAS_ILUSTRACAO, nomeMateria } from '@/lib/ilustracao'

interface Pasta {
  id: string
  materia: string
  tema: string
  driveFolder: string
  driveUrl: string
}

export default function AdminView() {
  const [pastas, setPastas] = useState<Pasta[]>([])
  const [loading, setLoading] = useState(true)
  const [materia, setMateria] = useState('')
  const [tema, setTema] = useState('')
  const [driveFolder, setDriveFolder] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    carregarPastas()
  }, [])

  async function carregarPastas() {
    try {
      const response = await fetch('/api/ilustrador/pastas-admin')
      const data = await response.json()

      if (data.success) {
        setPastas(data.pastas)
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao carregar pastas' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao carregar pastas' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!materia || !tema.trim() || !driveFolder.trim()) {
      setMessage({ type: 'error', text: 'Preencha todos os campos' })
      return
    }

    setSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/ilustrador/pastas-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materia, tema, driveFolder }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Pasta salva com sucesso!' })
        setTema('')
        setDriveFolder('')
        await carregarPastas()
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar pasta' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao salvar pasta' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (pasta: Pasta) => {
    if (!confirm(`Remover a pasta de ${nomeMateria(pasta.materia)} • ${pasta.tema}?`)) return

    try {
      const response = await fetch(
        `/api/ilustrador/pastas-admin?id=${encodeURIComponent(pasta.id)}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        setPastas((atual) => atual.filter((p) => p.id !== pasta.id))
        setMessage({ type: 'success', text: 'Pasta removida com sucesso!' })
      } else {
        setMessage({ type: 'error', text: 'Erro ao remover pasta' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao remover pasta' })
    }
  }

  const inputClass =
    'w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rf-green'

  const jaExiste = pastas.some(
    (p) => p.materia === materia && p.tema.toLowerCase() === tema.trim().toLowerCase()
  )

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Gerenciar Pastas de Ilustração
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure a pasta do Google Drive para cada combinação de matéria e tema
        </p>
      </div>

      {/* Formulário */}
      <div className="card dark:bg-gray-800 dark:border-gray-700 mb-8 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          ➕ Adicionar ou Atualizar Pasta
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Matéria *
              </label>
              <select
                value={materia}
                onChange={(e) => setMateria(e.target.value)}
                className={inputClass}
              >
                <option value="">Selecione uma matéria</option>
                {MATERIAS_ILUSTRACAO.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tema *
              </label>
              <input
                type="text"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                placeholder="Ex: Célula, Fotossíntese..."
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Link ou ID da pasta *
              </label>
              <input
                type="text"
                value={driveFolder}
                onChange={(e) => setDriveFolder(e.target.value)}
                placeholder="Cole o link do Drive ou só o ID"
                className={inputClass}
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            No campo do link você pode colar o endereço inteiro do navegador — o ID é extraído
            automaticamente.
          </p>

          {jaExiste && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                ⚠️ Já existe uma pasta para essa matéria e tema. Salvar vai substituir o link atual.
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-lg bg-rf-green text-white font-bold hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              {submitting ? '⏳ Salvando...' : '💾 Salvar Pasta'}
            </button>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}
            >
              <p
                className={`text-sm ${
                  message.type === 'success'
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}
              >
                {message.text}
              </p>
            </div>
          )}
        </form>
      </div>

      {/* Lista de Pastas */}
      <div className="card dark:bg-gray-800 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          📋 Pastas Configuradas ({pastas.length})
        </h3>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">⏳ Carregando...</p>
        ) : pastas.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            Nenhuma pasta configurada ainda. Adicione uma acima!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-2 font-bold text-gray-900 dark:text-white">
                    Matéria
                  </th>
                  <th className="text-left py-2 px-2 font-bold text-gray-900 dark:text-white">
                    Tema
                  </th>
                  <th className="text-left py-2 px-2 font-bold text-gray-900 dark:text-white">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody>
                {pastas.map((pasta) => (
                  <tr
                    key={pasta.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-3 px-2 text-gray-900 dark:text-white font-medium">
                      {nomeMateria(pasta.materia)}
                    </td>
                    <td className="py-3 px-2 text-gray-900 dark:text-white">{pasta.tema}</td>
                    <td className="py-3 px-2 space-x-2 whitespace-nowrap">
                      <a
                        href={pasta.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600"
                      >
                        🔗 Abrir
                      </a>
                      <button
                        onClick={() => handleDelete(pasta)}
                        className="inline-block px-3 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600"
                      >
                        🗑️ Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
