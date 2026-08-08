'use client'

import { useState, useEffect } from 'react'
import { ApostilaTable } from '@/components/cards/ApostilaTable'
import { BancoApostilasTable } from '@/components/cards/BancoApostilasTable'
import { CreateApostilaForm } from '@/components/forms/CreateApostilaForm'
import type { Apostila } from '@/types'

type Aba = 'producao' | 'banco'

export default function ApostilasPage() {
  const [apostilas, setApostilas] = useState<Apostila[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [serie, setSerie] = useState('TODOS')
  const [status, setStatus] = useState('TODOS')
  const [abaAtiva, setAbaAtiva] = useState<Aba>('producao')

  useEffect(() => {
    fetchApostilas()
  }, [serie, status])

  async function fetchApostilas() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (serie !== 'TODOS') params.append('serie', serie)
      if (status !== 'TODOS') params.append('status', status)

      const response = await fetch(`/api/apostilas?${params}`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setApostilas(data.data)
      }
    } catch (error) {
      console.error('Erro ao buscar apostilas:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteApostila(id: string) {
    try {
      const response = await fetch(`/api/apostilas/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        alert('Apostila excluída com sucesso!')
        fetchApostilas()
      } else {
        alert('Erro ao excluir apostila')
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir apostila')
    }
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Apostilas</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gerenciar apostilas do curso</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancelar' : '+ Nova Apostila'}
        </button>
      </div>

      {/* Abas */}
      <div style={{ borderColor: 'var(--line)' }} className="mb-8 flex gap-0 border-b">
        <button
          onClick={() => setAbaAtiva('producao')}
          className={`px-6 py-3 font-semibold transition-colors ${
            abaAtiva === 'producao'
              ? 'border-b-2 border-rf-green text-rf-green'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          Minhas Apostilas
        </button>
        <button
          onClick={() => setAbaAtiva('banco')}
          className={`px-6 py-3 font-semibold transition-colors ${
            abaAtiva === 'banco'
              ? 'border-b-2 border-rf-green text-rf-green'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          Banco de Apostilas
        </button>
      </div>

      {showForm && (
        <div className="card dark:bg-gray-800/50 dark:border-gray-700 mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-rf-green mb-4">Criar Nova Apostila</h2>
          <CreateApostilaForm
            onSuccess={() => {
              setShowForm(false)
              fetchApostilas()
            }}
          />
        </div>
      )}

      {abaAtiva === 'producao' ? (
        <>
          <div className="card dark:bg-gray-800/50 dark:border-gray-700 mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-rf-green mb-4">Filtros</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-base dark:text-gray-300">Série</label>
                <select
                  value={serie}
                  onChange={(e) => setSerie(e.target.value)}
                  className="input-base dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                >
                  <option value="TODOS">Todas</option>
                  <option value="PRIMEIRO_ANO">1º Ano</option>
                  <option value="SEGUNDO_ANO">2º Ano</option>
                  <option value="TERCEIRO_ANO">3º Ano</option>
                  <option value="CURSINHO">Cursinho</option>
                </select>
              </div>

              <div>
                <label className="label-base dark:text-gray-300">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input-base dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                >
                  <option value="TODOS">Todos</option>
                  <option value="RECEBIDO">Recebido</option>
                  <option value="EM_REVISAO_INICIAL">Em revisão inicial</option>
                  <option value="EM_DIAGRAMACAO">Em diagramação</option>
                  <option value="EM_REVISAO_FINAL">Em revisão final</option>
                  <option value="EM_AJUSTE">Em ajuste</option>
                  <option value="FINALIZADO">Finalizado</option>
                  <option value="ENVIADO">Enviado</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card dark:bg-gray-800/50 dark:border-gray-700">
            <ApostilaTable apostilas={apostilas} isLoading={loading} onDelete={handleDeleteApostila} />
          </div>
        </>
      ) : (
        <div className="card dark:bg-gray-800/50 dark:border-gray-700">
          <BancoApostilasTable
            apostilas={apostilas.filter((a) => a.status === 'FINALIZADO' || a.status === 'ENVIADO')}
            isLoading={loading}
          />
        </div>
      )}
    </div>
  )
}
