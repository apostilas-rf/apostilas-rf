'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
        credentials: 'include', // Permite enviar/receber cookies
      })

      if (!response.ok) {
        const data = await response.json()
        console.error('Login failed:', { status: response.status, error: data })
        setErro(data.error || 'Erro ao fazer login')
        return
      }

      const data = await response.json()
      console.log('Login successful:', data)
      // Token é automaticamente armazenado no cookie pelo servidor

      // Pequeno delay para garantir que o cookie foi setado
      await new Promise(resolve => setTimeout(resolve, 100))
      router.push('/dashboard')
    } catch (error) {
      setErro('Erro na conexão. Tente novamente.')
      console.error(error)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="inline-block w-32 h-32 relative mb-4">
          <Image
            src="/logo.png"
            alt="Logo RF Educação"
            fill
            className="object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Apostilas RF</h1>
        <p className="text-gray-500 text-sm mt-1">Plataforma de Produção de Apostilas</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-base">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="input-base"
            required
          />
        </div>

        <div>
          <label className="label-base">Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Sua senha"
            className="input-base"
            required
          />
        </div>

        {erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {erro}
          </div>
        )}

        <button
          type="submit"
          disabled={carregando}
          className="btn-primary w-full"
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="mt-6 space-y-3 text-center text-sm text-gray-500">
        <p>
          Não tem acesso?{' '}
          <Link href="/" className="text-rf-green font-medium hover:underline">
            Volte à página inicial
          </Link>
        </p>
        <p>
          Novo por aqui?{' '}
          <Link href="/auth/signup" className="text-rf-green font-medium hover:underline">
            Faça seu cadastro
          </Link>
        </p>
      </div>
    </div>
  )
}
