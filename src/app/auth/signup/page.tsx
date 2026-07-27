'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const ROLES = [
  { id: 'PROFESSOR', nome: 'Professor', emoji: '📚' },
  { id: 'DIAGRAMADOR', nome: 'Diagramador', emoji: '🎨' },
  { id: 'ILUSTRADOR', nome: 'Ilustrador', emoji: '🖼️' },
  { id: 'REVISOR', nome: 'Revisor', emoji: '✏️' },
  { id: 'EDITOR', nome: 'Editor', emoji: '📖' },
  { id: 'GESTOR', nome: 'Gestor', emoji: '👨‍💼' },
  { id: 'DIRECAO', nome: 'Diretor', emoji: '🎓' },
  { id: 'PROPRIETARIO', nome: 'Dono da Escola', emoji: '👑' },
]

export default function SignupPage() {
  const [step, setStep] = useState<'roles' | 'info' | 'pending'>('roles')
  const [primaryRole, setPrimaryRole] = useState('')
  const [secondaryRole, setSecondaryRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRoleSelect = (roleId: string) => {
    if (roleId === primaryRole) {
      setPrimaryRole('')
    } else if (!primaryRole) {
      setPrimaryRole(roleId)
    } else if (roleId === secondaryRole) {
      setSecondaryRole('')
    } else if (!secondaryRole) {
      setSecondaryRole(roleId)
    }
  }

  const selectedRoles = [primaryRole, secondaryRole].filter(Boolean)
  const canProceed = selectedRoles.length > 0

  const handleGoogleSignup = async () => {
    if (!canProceed) {
      setError('Selecione pelo menos uma função')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Iniciar fluxo OAuth do Google
      const response = await fetch('/api/auth/google-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryRole,
          secondaryRole: secondaryRole || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao iniciar cadastro')
        return
      }

      // Redirecionar para Google OAuth
      if (data.authUrl) {
        window.location.href = data.authUrl
      }
    } catch (err) {
      setError('Erro ao processar cadastro')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-rf-green to-rf-teal flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <div className="w-32 h-32 relative">
              <Image
                src="/logo-white.png"
                alt="Logo RF Educação"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Cadastro - Apostilas RF
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Selecione sua função para se cadastrar
          </p>
        </div>

        {/* Seleção de Funções */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Qual é a sua função? (Pode escolher até 2)
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ROLES.map((role) => {
              const isSelected = role.id === primaryRole || role.id === secondaryRole
              const isPrimary = role.id === primaryRole

              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`p-4 rounded-lg font-semibold text-center transition-all ${
                    isSelected
                      ? isPrimary
                        ? 'bg-rf-green text-white shadow-lg ring-2 ring-rf-green'
                        : 'bg-emerald-200 dark:bg-emerald-900 text-gray-900 dark:text-white ring-2 ring-emerald-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{role.emoji}</div>
                  <div className="text-xs">{role.nome}</div>
                  {isPrimary && <div className="text-xs mt-1">⭐ Principal</div>}
                  {isSelected && !isPrimary && <div className="text-xs mt-1">Adicional</div>}
                </button>
              )
            })}
          </div>

          {selectedRoles.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                ✅ Funções selecionadas: <strong>{selectedRoles.map(r => ROLES.find(x => x.id === r)?.nome).join(' + ')}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Erro */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Botão Google */}
        <button
          onClick={handleGoogleSignup}
          disabled={!canProceed || loading}
          className={`w-full py-3 px-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3 ${
            canProceed && !loading
              ? 'bg-rf-green text-white hover:bg-emerald-600 cursor-pointer shadow-lg'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? '⏳ Conectando...' : '🔓 Continuar com Google'}
        </button>

        {/* Link para Login */}
        <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
          Já tem conta?{' '}
          <Link href="/auth/login" className="text-rf-green font-bold hover:underline">
            Fazer login
          </Link>
        </p>

        {/* Info */}
        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <strong>⚠️ Importante:</strong> Após o cadastro, sua conta ficará pendente de aprovação pelo gestor. Você receberá um email quando for aprovado.
          </p>
        </div>
      </div>
    </main>
  )
}
