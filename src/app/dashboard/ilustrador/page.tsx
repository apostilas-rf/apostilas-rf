'use client'

import { useState, useEffect } from 'react'
import IlustradorView from './components/IlustradorView'
import AdminView from './components/AdminView'

export default function IlustradorPage() {
  const [activeTab, setActiveTab] = useState<'viewer' | 'admin'>('viewer')
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Obter role do usuário
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        if (data.success) {
          setUserRole(data.data.role)
        }
      } catch (error) {
        console.error('Erro ao obter role do usuário:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [])

  if (loading) {
    return <div className="text-center py-8">⏳ Carregando...</div>
  }

  // Se não for gestor, mostrar só visualizador
  if (userRole !== 'GESTOR') {
    return <IlustradorView />
  }

  // Gestor vê as duas abas
  return (
    <div>
      {/* Tabs */}
      <div className="mb-8 flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('viewer')}
          className={`px-6 py-3 font-bold text-lg transition-colors ${
            activeTab === 'viewer'
              ? 'text-rf-green border-b-2 border-rf-green'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          🎨 Acessar Ilustrações
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`px-6 py-3 font-bold text-lg transition-colors ${
            activeTab === 'admin'
              ? 'text-rf-green border-b-2 border-rf-green'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          ⚙️ Gerenciar Pastas
        </button>
      </div>

      {/* Conteúdo das abas */}
      {activeTab === 'viewer' && <IlustradorView />}
      {activeTab === 'admin' && <AdminView />}
    </div>
  )
}
