/**
 * URLs base e de callback do Google OAuth.
 *
 * Derivadas de APP_URL para que produção e desenvolvimento usem o mesmo
 * código — antes os callbacks de login estavam fixos em localhost:3000,
 * o que quebrava o login em produção.
 */
export const APP_URL = process.env.APP_URL || 'http://localhost:3000'

/** Callback do fluxo de cadastro (signup). */
export const GOOGLE_SIGNUP_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || `${APP_URL}/api/auth/google-callback`

/** Callback do fluxo de login. */
export const GOOGLE_LOGIN_REDIRECT_URI =
  process.env.GOOGLE_LOGIN_REDIRECT_URI || `${APP_URL}/api/auth/google-callback-login`
