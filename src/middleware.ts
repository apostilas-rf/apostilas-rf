import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const publicRoutes = [
  '/auth/login',
  '/auth/signup',
  '/auth/signup-pending',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/',
]

// Rotas de autenticação usadas por quem ainda não tem sessão. Os callbacks
// são chamados pelo próprio Google, que não envia o cookie de sessão.
const publicApiRoutes = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/google-login',
  '/api/auth/google-signup',
  '/api/auth/google-callback',
  '/api/auth/google-callback-login',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas podem ser acessadas sem autenticação
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // APIs públicas podem ser acessadas sem autenticação
  if (publicApiRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Verificar token em rotas protegidas
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api')) {
    const token = request.cookies.get('token')?.value

    if (!token) {
      // Se for API, retorna erro 401
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Se for página, redireciona para login
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Verificar validade do token
    const payload = await verifyToken(token)
    if (!payload) {
      // Token inválido ou expirado
      const response =
        pathname.startsWith('/api') ?
          NextResponse.json({ error: 'Token expired' }, { status: 401 }) :
          NextResponse.redirect(new URL('/auth/login', request.url))

      // Limpar cookie
      response.cookies.delete('token')
      return response
    }

    // Injetar user no header para uso em server components
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.sub)
    requestHeaders.set('x-user-role', payload.role)
    requestHeaders.set('x-user-email', payload.email)
    requestHeaders.set('x-user-name', payload.nome || '')

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
