'use client'

import { useState, useEffect } from 'react'

const BIMESTRES = ['P1', 'P2', 'P3', 'P4']
const SERIES = ['1º Ano', '2º Ano', '3º Ano', 'Cursinho']
const MATERIAS = [
  { id: 'biologia', nome: 'Biologia' },
  { id: 'fisica', nome: 'Física' },
  { id: 'quimica', nome: 'Química' },
  { id: 'matematica', nome: 'Matemática' },
  { id: 'filosofia', nome: 'Filosofia' },
  { id: 'geografia', nome: 'Geografia' },
  { id: 'portugues', nome: 'Língua Portuguesa' },
  { id: 'literatura', nome: 'Literatura' },
  { id: 'redacao', nome: 'Redação' },
  { id: 'historia', nome: 'História' },
  { id: 'sociologia', nome: 'Sociologia' },
]

interface Pasta {
  key: string
  driveFolder: string
  driveUrl: string
}

export default function AdminIlustradorPage() {
  const [pastas, setPastas] = useState<Pasta[]>([])
  const [loading, setLoading] = useState(true)
  const [bimestre, setBimestre] = useState('')
  const [serie, setSerie] = useState('')
  const [materia, setMateria] = useState('')
  const [driveFolder, setDriveFolder] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Carregar pastas
  useEffect(() => {
    const fetchPastas = async () => {
      try {
        const response = await fetch('/api/ilustrador/pastas-admin')
        const data = await response.json()

        if (data.success) {
          const pastasList = Object.entries(data.pastas).map(([key, driveFolder]) => ({
            key,
            driveFolder: driveFolder as string,
            driveUrl: `https://drive.google.com/drive/folders/${driveFolder}?usp=sharing`,
          }))
          setPastas(pastasList)
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Erro ao carregar pastas',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPastas()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bimestre || !serie || !materia || !driveFolder) {
      setMessage({
        type: 'error',
        text: 'Preencha todos os campos',
      })
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/ilustrador/pastas-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bimestre,
          serie,
          materia,
          driveFolder,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Pasta configurada com sucesso!',
        })

        // Atualizar lista
        const novoKey = `${bimestre}|${serie}|${materia}`
        setPastas([
          ...pastas.filter((p) => p.key !== novoKey),
          {
            key: novoKey,
            driveFolder,
            driveUrl: `https://drive.google.com/drive/folders/${driveFolder}?usp=sharing`,
          },
        ])

        // Limpar formulário
        setBimestre('')
        setSerie('')
        setMateria('')
        setDriveFolder('')
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Erro ao salvar pasta',
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao salvar pasta',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (key: string) => {
    if (!confirm('Tem certeza que deseja remover esta pasta?')) {
      return
    }

    try {
      const response = await fetch(`/api/ilustrador/pastas-admin?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPastas(pastas.filter((p) => p.key !== key))
        setMessage({
          type: 'success',
          text: 'Pasta removida com sucesso!',
        })
      } else {
        setMessage({
          type: 'error',
          text: 'Erro ao remover pasta',
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao remover pasta',
      })
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          🔧 Gerenciar Pastas de Ilustração
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure as pastas do Google Drive para cada combinação de bimestre, série e matéria
        </p>
      </div>

      {/* Formulário */}
      <div className="card dark:bg-gray-800 dark:border-gray-700 mb-8 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          ➕ Adicionar Nova Pasta
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bimestre
              </label>
              <select
                value={bimestre}
                onChange={(e) => setBimestre(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rf-green"
              >
                <option value="">Selecione</option>
                {BIMESTRES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Série
              </label>
              <select
                value={serie}
                onChange={(e) => setSerie(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rf-green"
              >
                <option value="">Selecione</option>
                {SERIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Matéria
              </label>
              <select
                value={materia}
                onChange={(e) => setMateria(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rf-green"
              >
                <option value="">Selecione</option>
                {MATERIAS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID da Pasta (Google Drive)
              </label>
              <input
                type="text"
                value={driveFolder}
                onChange={(e) => setDriveFolder(e.target.value)}
                placeholder="1ABC2DEF3GHI..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rf-green"
              />
            </div>
          </div>

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
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          📋 Pastas Configuradas ({pastas.length})
        </h2>

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
                    Bimestre
                  </th>
                  <th className="text-left py-2 px-2 font-bold text-gray-900 dark:text-white">
                    Série
                  </th>
                  <th className="text-left py-2 px-2 font-bold text-gray-900 dark:text-white">
                    Matéria
                  </th>
                  <th className="text-left py-2 px-2 font-bold text-gray-900 dark:text-white">
                    ID da Pasta
                  </th>
                  <th className="text-left py-2 px-2 font-bold text-gray-900 dark:text-white">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody>
                {pastas.map((pasta) => {
                  const [bim, ser, mat] = pasta.key.split('|')
                  const materiaObj = MATERIAS.find((m) => m.id === mat)

                  return (
                    <tr
                      key={pasta.key}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-3 px-2 text-gray-900 dark:text-white">{bim}</td>
                      <td className="py-3 px-2 text-gray-900 dark:text-white">{ser}</td>
                      <td className="py-3 px-2 text-gray-900 dark:text-white">
                        {materiaObj?.nome}
                      </td>
                      <td className="py-3 px-2 text-gray-600 dark:text-gray-400 text-xs font-mono">
                        {pasta.driveFolder.substring(0, 15)}...
                      </td>
                      <td className="py-3 px-2 space-x-2">
                        <a
                          href={pasta.driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600"
                        >
                          🔗 Abrir
                        </a>
                        <button
                          onClick={() => handleDelete(pasta.key)}
                          className="inline-block px-3 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600"
                        >
                          🗑️ Remover
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
