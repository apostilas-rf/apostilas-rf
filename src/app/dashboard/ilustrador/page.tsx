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

interface PastaInfo {
  success: boolean
  driveUrl?: string
  error?: string
  message?: string
}

export default function IlustradorPage() {
  const [bimestre, setBimestre] = useState('')
  const [serie, setSerie] = useState('')
  const [materia, setMateria] = useState('')
  const [pastaInfo, setPastaInfo] = useState<PastaInfo | null>(null)
  const [loading, setLoading] = useState(false)

  // Buscar informações da pasta quando mudar a seleção
  useEffect(() => {
    if (!bimestre || !serie || !materia) {
      setPastaInfo(null)
      return
    }

    const fetchPasta = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `/api/ilustrador/pastas?bimestre=${encodeURIComponent(bimestre)}&serie=${encodeURIComponent(serie)}&materia=${encodeURIComponent(materia)}`
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
  }, [bimestre, serie, materia])

  const handleAccessDrive = () => {
    if (pastaInfo?.driveUrl) {
      window.open(pastaInfo.driveUrl, '_blank')
    }
  }

  const isComplete = bimestre && serie && materia
  const hasPasta = pastaInfo?.success
  const driveUrl = pastaInfo?.driveUrl

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          🎨 Ilustração
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Acesse a pasta do Drive para gerenciar imagens por matéria e bimestre
        </p>
      </div>

      {/* Seletores */}
      <div className="card dark:bg-gray-800 dark:border-gray-700 mb-8 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bimestre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bimestre
            </label>
            <select
              value={bimestre}
              onChange={(e) => setBimestre(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rf-green"
            >
              <option value="">Selecione um bimestre</option>
              {BIMESTRES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Série */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Série
            </label>
            <select
              value={serie}
              onChange={(e) => setSerie(e.target.value)}
              disabled={!bimestre}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rf-green disabled:opacity-50"
            >
              <option value="">Selecione uma série</option>
              {SERIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Matéria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Matéria
            </label>
            <select
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              disabled={!serie}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rf-green disabled:opacity-50"
            >
              <option value="">Selecione uma matéria</option>
              {MATERIAS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
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
              ✅ <strong>Pasta encontrada:</strong> {bimestre} • {serie} • {MATERIAS.find(m => m.id === materia)?.nome}
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
              Entre em contato com o gestor para configurar as pastas do Drive.
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

      {/* Histórico de Acessos */}
      <div className="card dark:bg-gray-800 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          📋 Guia de Organização
        </h2>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>Bimestres:</strong> P1 (1º Bimestre), P2 (2º Bimestre), P3 (3º Bimestre), P4 (4º Bimestre)
          </p>
          <p>
            <strong>Séries:</strong> 1º Ano, 2º Ano, 3º Ano, Cursinho
          </p>
          <p>
            <strong>Matérias:</strong> Biologia, Física, Química, Matemática, Filosofia, Geografia, Português, Literatura, Redação, História, Sociologia
          </p>
          <p className="pt-2 border-t border-gray-200 dark:border-gray-700">
            ℹ️ As pastas do Drive serão configuradas pelo gestor. Entre em contato caso não consiga acessar.
          </p>
        </div>
      </div>
    </div>
  )
}
