'use client'

import { useState, useEffect } from 'react'
import { ApostilaTable } from '@/components/cards/ApostilaTable'
import { CreateApostilaForm } from '@/components/forms/CreateApostilaForm'
import type { Apostila } from '@/types'

export default function ApostilasPage() {
  const [apostilas, setApostilas] = useState<Apostila[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [serie, setSerie] = useState('TODOS')
  const [status, setStatus] = useState('TODOS')

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
              <option value="EM_REVISAO_INICIAL">Em Revisão Inicial</option>
              <option value="DISTRIBUIDO">Distribuído</option>
              <option value="EM_CONFECCAO">Em Confecção</option>
              <option value="EM_REVISAO_POS_EDICAO">Em Revisão Pós-Edição</option>
              <option value="EM_AJUSTE">Em Ajuste</option>
              <option value="FINALIZADO">Finalizado</option>
              <option value="ENVIADO_GRAFICA">Enviado à Gráfica</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card dark:bg-gray-800/50 dark:border-gray-700">
        <ApostilaTable apostilas={apostilas} isLoading={loading} onDelete={handleDeleteApostila} />
      </div>
    </div>
  )
}
