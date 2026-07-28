'use client'

import { useState, useEffect } from 'react'
import { MATERIAS_ILUSTRACAO, nomeMateria } from '@/lib/ilustracao'

interface PastaInfo {
  success?: boolean
  driveUrl?: string
  error?: string
  message?: string
}

export default function IlustradorView() {
  const [materia, setMateria] = useState('')
  const [tema, setTema] = useState('')
  const [temas, setTemas] = useState<string[]>([])
  const [pastaInfo, setPastaInfo] = useState<PastaInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingTemas, setLoadingTemas] = useState(false)

  // Buscar temas quando a matéria mudar
  useEffect(() => {
    if (!materia) {
      setTemas([])
      setTema('')
      setPastaInfo(null)
      return
    }

    const fetchTemas = async () => {
      setLoadingTemas(true)
      setTema('')
      setPastaInfo(null)
      try {
        const response = await fetch(
          `/api/ilustrador/pastas?materia=${encodeURIComponent(materia)}`
        )
        const data = await response.json()
        setTemas(data.success ? data.temas || [] : [])
      } catch (error) {
        console.error('Erro ao buscar temas:', error)
        setTemas([])
      } finally {
        setLoadingTemas(false)
      }
    }

    fetchTemas()
  }, [materia])

  // Buscar a pasta quando o tema mudar
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
        setPastaInfo(await response.json())
      } catch {
        setPastaInfo({ success: false, error: 'Erro ao buscar pasta' })
      } finally {
        setLoading(false)
      }
    }

    fetchPasta()
  }, [materia, tema])

  const isComplete = Boolean(materia && tema)
  const hasPasta = Boolean(pastaInfo?.success && pastaInfo.driveUrl)

  const selectClass =
    'w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rf-green disabled:opacity-50'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">🎨 Ilustração</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Acesse a pasta do Drive para gerenciar imagens por matéria e tema
        </p>
      </div>

      {/* Seletores */}
      <div className="card dark:bg-gray-800 dark:border-gray-700 mb-8 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Matéria
            </label>
            <select
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              className={selectClass}
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
              Tema
            </label>
            <select
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              disabled={!materia || loadingTemas}
              className={selectClass}
            >
              <option value="">
                {loadingTemas
                  ? '⏳ Carregando temas...'
                  : materia && temas.length === 0
                    ? 'Nenhum tema cadastrado'
                    : 'Selecione um tema'}
              </option>
              {temas.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {materia && !loadingTemas && temas.length === 0 && (
          <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              ⚠️ <strong>Nenhum tema cadastrado para {nomeMateria(materia)}</strong>
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              Peça ao gestor para cadastrar as pastas dessa matéria.
            </p>
          </div>
        )}

        {isComplete && loading && (
          <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">⏳ Carregando...</p>
          </div>
        )}

        {isComplete && !loading && hasPasta && (
          <div className="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✅ <strong>Pasta encontrada:</strong> {nomeMateria(materia)} • {tema}
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
          </div>
        )}
      </div>

      {/* Botão de Acesso */}
      {isComplete && hasPasta && !loading && (
        <div className="mb-8">
          <a
            href={pastaInfo!.driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center px-6 py-4 rounded-full font-bold text-lg bg-rf-green text-white hover:bg-emerald-600 transition-colors shadow-lg"
          >
            🚀 Acessar Drive
          </a>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3">
            A pasta abre numa nova aba do Google Drive
          </p>
        </div>
      )}

      {/* Guia de Organização */}
      <div className="card dark:bg-gray-800 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📋 Como Funciona</h2>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>Matérias:</strong> Biologia, Física, Química, Matemática, Filosofia, Geografia,
            História, Sociologia, Português, Literatura, Redação
          </p>
          <p>
            <strong>Temas:</strong> Customizáveis por matéria (ex: Célula, Fotossíntese, Mitose para
            Biologia)
          </p>
          <p className="pt-2 border-t border-gray-200 dark:border-gray-700">
            ℹ️ Os temas são adicionados pelo gestor conforme as pastas são criadas no Drive.
          </p>
        </div>
      </div>
    </div>
  )
}
