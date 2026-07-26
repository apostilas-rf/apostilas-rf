'use client'

import { useState } from 'react'

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

export default function IlustradorPage() {
  const [bimestre, setBimestre] = useState('')
  const [serie, setSerie] = useState('')
  const [materia, setMateria] = useState('')

  const getDriveUrl = () => {
    if (!bimestre || !serie || !materia) return null
    // Template: será configurado pelo gestor
    // Formato: https://drive.google.com/drive/folders/[FOLDER_ID]?usp=sharing
    const serieSlug = serie.replace('º Ano', '').replace('Cursinho', 'cursinho').toLowerCase()
    const materiaObj = MATERIAS.find(m => m.id === materia)

    // Placeholder - você vai configurar os IDs reais do Drive depois
    return `https://drive.google.com/drive/folders/[CONFIGURAR_${bimestre}_${serieSlug}_${materia.toUpperCase()}]?usp=sharing`
  }

  const handleAccessDrive = () => {
    const url = getDriveUrl()
    if (url) {
      window.open(url, '_blank')
    }
  }

  const isComplete = bimestre && serie && materia
  const driveUrl = getDriveUrl()

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
        {isComplete && (
          <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              📂 <strong>Pasta:</strong> {bimestre} • {serie} • {MATERIAS.find(m => m.id === materia)?.nome}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              {driveUrl}
            </p>
          </div>
        )}
      </div>

      {/* Botão de Acesso */}
      {isComplete && (
        <div className="mb-8">
          <button
            onClick={handleAccessDrive}
            className="w-full px-6 py-4 rounded-full bg-rf-green text-white font-bold text-lg hover:bg-emerald-600 transition-colors shadow-lg"
          >
            🚀 Acessar Drive
          </button>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3">
            Você será redirecionado para a pasta no Google Drive
          </p>
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
