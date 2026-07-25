'use client'

import { useEffect, useState } from 'react'
import { ProfessorCard } from '@/components/professor/ProfessorCard'
import { SetPrazoModal } from '@/components/professor/SetPrazoModal'
import { PrazosTab } from '@/components/prazos/PrazosTab'

interface Professor {
  id: string
  nome: string
  email: string
  apostilas: {
    id: string
    titulo: string
    materia: string
    status: string
    serie: string
    criadoEm: Date
    prazoEstimado?: Date
    arquivos: { id: string }[]
  }[]
}

interface ProfessorComStatus extends Professor {
  totalApostilas: number
  apostilasEnviadas: number
  percentualEnvio: number
  temAtrasados: boolean
}

export default function ProfessoresPage() {
  const [professores, setProfessores] = useState<ProfessorComStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [apostilaParaPrazo, setApostilaParaPrazo] = useState<any>(null)
  const [filtro, setFiltro] = useState<'todos' | 'atrasados' | 'em-dia'>('todos')
  const [abaAtiva, setAbaAtiva] = useState<'professores' | 'prazos'>('professores')

  useEffect(() => {
    fetchProfessores()
  }, [])

  async function fetchProfessores() {
    try {
      setLoading(true)
      const response = await fetch('/api/professores', {
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Erro ao buscar professores')

      const data = await response.json()
      const professoresData = data.data || []
      const processados = professoresData.map((prof: Professor) => {
        const apostilas = prof.apostilas || []
        const totalApostilas = apostilas.length
        const apostilasEnviadas = apostilas.filter(
          (a) => a.arquivos && a.arquivos.length > 0
        ).length
        const percentualEnvio =
          totalApostilas > 0
            ? Math.round((apostilasEnviadas / totalApostilas) * 100)
            : 0

        const temAtrasados = apostilas.some(
          (a) =>
            a.prazoEstimado &&
            new Date(a.prazoEstimado) < new Date() &&
            (!a.arquivos || a.arquivos.length === 0)
        )

        return {
          ...prof,
          totalApostilas,
          apostilasEnviadas,
          percentualEnvio,
          temAtrasados,
        }
      })

      setProfessores(processados)
      setError('')
    } catch (err) {
      setError('Erro ao carregar professores')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function getProfessoresFiltrads() {
    return professores.filter((prof) => {
      if (filtro === 'atrasados') return prof.temAtrasados
      if (filtro === 'em-dia') return !prof.temAtrasados
      return true
    })
  }

  function abrirModalPrazo(apostila: any) {
    setApostilaParaPrazo(apostila)
    setModalAberto(true)
  }

  const filtrados = getProfessoresFiltrads()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rf-green mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando professores...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">👨‍🏫 Professores</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Acompanhe o progresso de envio de materiais</p>

        {/* Abas */}
        <div className="flex gap-2 mt-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setAbaAtiva('professores')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              abaAtiva === 'professores'
                ? 'border-rf-green text-rf-green'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            Professores
          </button>
          <button
            onClick={() => setAbaAtiva('prazos')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              abaAtiva === 'prazos'
                ? 'border-rf-green text-rf-green'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            Prazos
          </button>
        </div>
      </div>

      {abaAtiva === 'professores' && (
        <>
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 rounded">
              {error}
              <button
                onClick={fetchProfessores}
                className="ml-4 font-medium underline hover:no-underline"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Filtros */}
          <div className="flex gap-2 mb-6">
            {(['todos', 'em-dia', 'atrasados'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-4 py-2 rounded font-medium ${
                  filtro === f
                    ? 'bg-rf-green text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {f === 'todos' && 'Todos'}
                {f === 'em-dia' && 'Em Dia'}
                {f === 'atrasados' && 'Atrasados'}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total de Professores</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{professores.length}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Em Dia</p>
              <p className="text-3xl font-bold text-rf-green mt-2">
                {professores.filter((p) => !p.temAtrasados).length}
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-red-200 dark:border-red-800/50 shadow-sm">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">⚠️ Atrasados</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                {professores.filter((p) => p.temAtrasados).length}
              </p>
            </div>
          </div>

          {/* Lista de Professores */}
          {filtrados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtrados.map((professor) => (
                <ProfessorCard
                  key={professor.id}
                  professor={professor}
                  onSetPrazo={abrirModalPrazo}
                  onRefresh={fetchProfessores}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">Nenhum professor encontrado</p>
            </div>
          )}
        </>
      )}

      {abaAtiva === 'prazos' && (
        <div className="mt-6">
          <PrazosTab setorId="PROFESSOR" setorLabel="Professores" />
        </div>
      )}

      {/* Modal de Prazo */}
      {modalAberto && apostilaParaPrazo && (
        <SetPrazoModal
          apostila={apostilaParaPrazo}
          onClose={() => {
            setModalAberto(false)
            setApostilaParaPrazo(null)
          }}
          onSuccess={() => {
            setModalAberto(false)
            setApostilaParaPrazo(null)
            fetchProfessores()
          }}
        />
      )}
    </div>
  )
}
