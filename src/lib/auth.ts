import { jwtVerify, SignJWT } from 'jose'
import bcrypt from 'bcryptjs'
import type { JWTPayload, UserRole, UserSession } from '@/types'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Security: Require JWT_SECRET in environment, don't allow weak defaults
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production')
  }
  console.warn('⚠️ WARNING: JWT_SECRET not set, using development default. This is NOT secure!')
}

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.NODE_ENV === 'production'
    ? (() => { throw new Error('JWT_SECRET required') })()
    : 'dev-jwt-secret-change-in-production'
)

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createToken(userId: string, email: string, role: UserRole, nome?: string): Promise<string> {
  const token = await new SignJWT({ sub: userId, email, role, nome })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)

  return token
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, secret)
    return verified.payload as JWTPayload
  } catch (error) {
    return null
  }
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    return null
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return null
  }

  // Você pode buscar dados adicionais do usuário do banco se necessário
  return {
    id: payload.sub,
    email: payload.email,
    nome: '', // Será preenchido depois
    role: payload.role,
    ativo: true,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/',
  })
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('token')
}

export function hasRole(role: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(role)
}

export function hasAnyRole(role: UserRole, allowedRoles: UserRole[]): boolean {
  return hasRole(role, allowedRoles)
}

// Verificação de acesso para rotas protegidas
export async function requireAuth(requiredRoles?: UserRole[]): Promise<UserSession> {
  const session = await getSession()

  if (!session) {
    redirect('/auth/login')
  }

  if (requiredRoles && !hasAnyRole(session.role, requiredRoles)) {
    redirect('/dashboard')
  }

  return session
}
