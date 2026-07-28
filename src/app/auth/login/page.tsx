'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

// Os callbacks do Google redirecionam para cá com ?error=<codigo> quando algo
// falha. Sem esta tradução a tela voltava em branco, sem dizer o que houve.
const ERROS_OAUTH: Record<string, string> = {
  invalid_request: 'O Google não devolveu os dados esperados. Tente novamente.',
  invalid_state:
    'A sessão de login expirou ou foi aberta em outro endereço. Comece o login de novo nesta mesma página.',
  token_error: 'Não foi possível validar sua conta no Google. Tente novamente.',
  userinfo_error: 'Não foi possível obter seus dados do Google. Tente novamente.',
  user_not_found:
    'Este email ainda não está cadastrado na plataforma. Faça o cadastro e aguarde a aprovação do gestor.',
  inactive_user: 'Seu cadastro ainda não foi aprovado pelo gestor.',
  account_mismatch: 'Este email já está vinculado a outra conta do Google.',
  server_error: 'Erro inesperado no servidor. Tente novamente em instantes.',
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [carregandoGoogle, setCarregandoGoogle] = useState(false)

  // Lido de window para não precisar de <Suspense>, já que esta página é estática.
  useEffect(() => {
    const codigo = new URLSearchParams(window.location.search).get('error')
    if (codigo) {
      setErro(ERROS_OAUTH[codigo] || `Não foi possível entrar (${codigo}).`)
    }
  }, [])

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

  async function handleGoogleLogin() {
    setCarregandoGoogle(true)
    setErro('')

    try {
      const response = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        setErro(data.error || 'Erro ao iniciar login com Google')
        return
      }

      // Redirecionar para Google OAuth
      if (data.authUrl) {
        window.location.href = data.authUrl
      }
    } catch (err) {
      setErro('Erro ao conectar com Google')
      console.error(err)
    } finally {
      setCarregandoGoogle(false)
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

      {/* Botão Google */}
      <button
        onClick={handleGoogleLogin}
        disabled={carregandoGoogle}
        className="w-full mb-6 py-3 px-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {carregandoGoogle ? '⏳ Conectando...' : '🔓 Continuar com Google'}
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Ou faça login com email</span>
        </div>
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
