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
    // Cartão único partido em dois: marca à esquerda, formulário à direita.
    // overflow-hidden é o que faz o painel verde ser recortado pelo raio.
    <div className="panel grid w-full max-w-5xl overflow-hidden shadow-floating lg:grid-cols-2">
      {/* Painel da marca. Escondido no celular: numa tela estreita ele empurraria
          o formulário para baixo da dobra. */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-rf-green p-10 text-white lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 15% 20%, rgb(255 255 255 / 0.14), transparent 45%), radial-gradient(circle at 85% 75%, rgb(255 255 255 / 0.10), transparent 40%)',
          }}
        />

        <div className="relative">
          <div className="relative mb-8 h-14 w-14">
            <Image src="/logo-white.png" alt="" fill className="object-contain" />
          </div>
          <h1 className="font-ubuntu text-4xl font-bold leading-tight tracking-tight">
            Apostilas RF
          </h1>
          <p className="mt-3 max-w-xs text-white/70">
            A produção das apostilas, do primeiro rascunho ao arquivo final.
          </p>
        </div>

        <ul className="relative space-y-4">
          {[
            'Escreva capítulos com LaTeX e formatação',
            'Envio automático para o Drive da escola',
            'Acompanhe o status de cada apostila',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-white/90">
              <svg
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Painel do formulário */}
      <div className="p-8 sm:p-10 lg:p-12">
        <div className="mb-8">
          <div className="relative mb-6 h-12 w-12 lg:hidden">
            <Image src="/logo.png" alt="" fill className="object-contain dark:hidden" />
            <Image src="/logo-white.png" alt="" fill className="hidden object-contain dark:block" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Entrar</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Use sua conta da escola para continuar.
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={carregandoGoogle}
          className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {carregandoGoogle ? (
            'Conectando…'
          ) : (
            <>
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.11a6.6 6.6 0 010-4.22V7.05H2.18a11 11 0 000 9.9l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1a11 11 0 00-9.82 6.05l3.66 2.84C6.71 7.29 9.14 5.38 12 5.38z"
                />
              </svg>
              Continuar com Google
            </>
          )}
        </button>

        <div className="my-6 flex items-center gap-4">
          <span className="h-px flex-1" style={{ backgroundColor: 'var(--line-strong)' }} />
          <span className="text-xs text-gray-400 dark:text-gray-500">ou com email</span>
          <span className="h-px flex-1" style={{ backgroundColor: 'var(--line-strong)' }} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-base" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="input-base"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="label-base" htmlFor="senha">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              className="input-base"
              autoComplete="current-password"
              required
            />
          </div>

          {erro && (
            <p
              role="alert"
              className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"
            >
              {erro}
            </p>
          )}

          <button type="submit" disabled={carregando} className="btn-primary w-full">
            {carregando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Novo por aqui?{' '}
          <Link href="/auth/signup" className="font-medium text-rf-green hover:underline">
            Faça seu cadastro
          </Link>
        </p>
      </div>
    </div>
  )
}
