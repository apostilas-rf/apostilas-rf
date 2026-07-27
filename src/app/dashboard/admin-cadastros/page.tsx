'use client'

import { useState, useEffect } from 'react'

interface PendingUser {
  id: string
  email: string
  nome: string
  role: string
  rolesAdicionais: { role: string }[]
  criadoEm: string
}

export default function AdminCadastrosPage() {
  const [usuarios, setUsuarios] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch('/api/admin/cadastros-pendentes')
      const data = await response.json()
      if (data.success) {
        setUsuarios(data.data || [])
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao carregar cadastros pendentes',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId: string) => {
    if (!confirm('Deseja aprovar este cadastro?')) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/aprovar-cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Cadastro aprovado com sucesso!',
        })
        setUsuarios(usuarios.filter((u) => u.id !== userId))
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Erro ao aprovar cadastro',
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao processar aprovação',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async (userId: string) => {
    if (!confirm('Deseja rejeitar este cadastro? A conta será deletada.')) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/rejeitar-cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Cadastro rejeitado',
        })
        setUsuarios(usuarios.filter((u) => u.id !== userId))
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Erro ao rejeitar cadastro',
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao processar rejeição',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          👥 Aprovar Cadastros
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie os cadastros pendentes de novos usuários
        </p>
      </div>

      {/* Mensagem */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
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

      {/* Lista de Cadastros */}
      <div className="card dark:bg-gray-800 dark:border-gray-700 p-6">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">⏳ Carregando...</p>
        ) : usuarios.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-gray-600 dark:text-gray-400">
              Nenhum cadastro pendente no momento
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-3 font-bold text-gray-900 dark:text-white">
                    Nome
                  </th>
                  <th className="text-left py-3 px-3 font-bold text-gray-900 dark:text-white">
                    Email
                  </th>
                  <th className="text-left py-3 px-3 font-bold text-gray-900 dark:text-white">
                    Funções
                  </th>
                  <th className="text-left py-3 px-3 font-bold text-gray-900 dark:text-white">
                    Data
                  </th>
                  <th className="text-left py-3 px-3 font-bold text-gray-900 dark:text-white">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((user) => {
                  const roles = [
                    user.role,
                    ...user.rolesAdicionais.map((r) => r.role),
                  ]

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">
                        {user.nome}
                      </td>
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-xs">
                        {user.email}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex gap-1 flex-wrap">
                          {roles.map((role, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                idx === 0
                                  ? 'bg-rf-green text-white'
                                  : 'bg-emerald-200 dark:bg-emerald-900/50 text-gray-900 dark:text-white'
                              }`}
                            >
                              {idx === 0 ? '⭐' : ''} {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-xs">
                        {new Date(user.criadoEm).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-3 space-x-2">
                        <button
                          onClick={() => handleApprove(user.id)}
                          disabled={submitting}
                          className="inline-block px-3 py-1 rounded bg-green-500 text-white text-xs hover:bg-green-600 disabled:opacity-50"
                        >
                          ✅ Aprovar
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          disabled={submitting}
                          className="inline-block px-3 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600 disabled:opacity-50"
                        >
                          ❌ Rejeitar
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
