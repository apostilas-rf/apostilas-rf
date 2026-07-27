'use client'

import { useState, useEffect } from 'react'

const MATERIAS = [
  { id: 'biologia', nome: 'Biologia' },
  { id: 'fisica', nome: 'Física' },
  { id: 'quimica', nome: 'Química' },
  { id: 'matematica', nome: 'Matemática' },
  { id: 'filosofia', nome: 'Filosofia' },
  { id: 'geografia', nome: 'Geografia' },
  { id: 'historia', nome: 'História' },
  { id: 'sociologia', nome: 'Sociologia' },
  { id: 'portugues', nome: 'Língua Portuguesa' },
  { id: 'literatura', nome: 'Literatura' },
  { id: 'redacao', nome: 'Redação' },
]

interface PastaInfo {
  success: boolean
  driveUrl?: string
  error?: string
  message?: string
  temas?: string[]
}

export default function IlustradorView() {
  const [materia, setMateria] = useState('')
  const [tema, setTema] = useState('')
  const [temas, setTemas] = useState<string[]>([])
  const [pastaInfo, setPastaInfo] = useState<PastaInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingTemas, setLoadingTemas] = useState(false)

  // Buscar temas quando materia mudar
  useEffect(() => {
    if (!materia) {
      setTemas([])
      setTema('')
      setPastaInfo(null)
      return
    }

    const fetchTemas = async () => {
      setLoadingTemas(true)
      try {
        const response = await fetch(`/api/ilustrador/pastas?materia=${encodeURIComponent(materia)}`)
        const data = await response.json()
        if (data.success) {
          setTemas(data.temas || [])
        }
      } catch (error) {
        console.error('Erro ao buscar temas:', error)
      } finally {
        setLoadingTemas(false)
      }
    }

    fetchTemas()
  }, [materia])

  // Buscar pasta quando tema mudar
  useEffect(() => {
    if (!materia || !tema) {
      setPastaInfo(null)
      return
    }

    const fetchPasta = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `/api/ilustrador/pastas?materia=${encodeURIComponent(materia)}&tema=${encodeURIComponent(tema)}`
        )
        const data = await response.json()
        setPastaInfo(data)
      } catch (error) {
        setPastaInfo({
          success: false,
          error: 'Erro ao buscar pasta',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPasta()
  }, [materia, tema])

  const handleAccessDrive = () => {
    if (pastaInfo?.driveUrl) {
      window.open(pastaInfo.driveUrl, '_blank')
    }
  }

  const isComplete = materia && tema
  const hasPasta = pastaInfo?.success
  const driveUrl = pastaInfo?.driveUrl

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          🎨 Ilustração
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Acesse a pasta do Drive para gerenciar imagens por matéria e tema
        </p>
      </div>

      {/* Seletores */}
      <div className="card dark:bg-gray-800 dark:border-gray-700 mb-8 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Matéria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Matéria
            </label>
            <select
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rf-green"
            >
              <option value="">Selecione uma matéria</option>
              {MATERIAS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Tema */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tema
            </label>
            <select
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              disabled={!materia}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rf-green disabled:opacity-50"
            >
              <option value="">
                {loadingTemas ? '⏳ Carregando temas...' : 'Selecione um tema'}
              </option>
              {temas.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Info Box */}
        {isComplete && loading && (
          <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">⏳ Carregando...</p>
          </div>
        )}

        {isComplete && !loading && hasPasta && (
          <div className="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✅ <strong>Pasta encontrada:</strong> {MATERIAS.find(m => m.id === materia)?.nome} • {tema}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2 break-all">
              {driveUrl}
            </p>
          </div>
        )}

        {isComplete && !loading && !hasPasta && (
          <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              ⚠️ <strong>Pasta não configurada</strong>
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              {pastaInfo?.message || pastaInfo?.error}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Entre em contato com o gestor para configurar os temas.
            </p>
          </div>
        )}
      </div>

      {/* Botão de Acesso */}
      {isComplete && (
        <div className="mb-8">
          <button
            onClick={handleAccessDrive}
            disabled={!hasPasta || loading}
            className={`w-full px-6 py-4 rounded-full font-bold text-lg transition-colors shadow-lg ${
              hasPasta && !loading
                ? 'bg-rf-green text-white hover:bg-emerald-600 cursor-pointer'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? '⏳ Carregando...' : hasPasta ? '🚀 Acessar Drive' : '❌ Pasta não disponível'}
          </button>
          {hasPasta && !loading && (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3">
              Você será redirecionado para a pasta no Google Drive
            </p>
          )}
        </div>
      )}

      {/* Guia de Organização */}
      <div className="card dark:bg-gray-800 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          📋 Como Funciona
        </h2>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>Matérias:</strong> Biologia, Física, Química, Matemática, Filosofia, Geografia, História, Sociologia, Português, Literatura, Redação
          </p>
          <p>
            <strong>Temas:</strong> Customizáveis por matéria (ex: Célula, Fotossíntese, Mitose para Biologia)
          </p>
          <p className="pt-2 border-t border-gray-200 dark:border-gray-700">
            ℹ️ Os temas são adicionados dinamicamente pelo gestor conforme criam as pastas no Drive.
          </p>
        </div>
      </div>
    </div>
  )
}
