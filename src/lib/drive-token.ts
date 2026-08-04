import { db } from './db'

// URL pública do app. Usada para montar o redirect_uri do OAuth, que precisa
// bater EXATAMENTE com o que está registrado no Google Console.
export function urlBaseApp(): string | null {
  const configurada = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configurada && /^https?:\/\//.test(configurada)) {
    return configurada.replace(/\/+$/, '')
  }

  // Domínio estável de produção da Vercel (não o da build específica).
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercel) return `https://${vercel.replace(/\/+$/, '')}`

  return null
}

export function urlCallbackDrive(): string | null {
  const base = urlBaseApp()
  return base ? `${base}/api/auth/google-drive-callback` : null
}

// Os capítulos vão todos para as MESMAS pastas da escola (GOOGLE_DRIVE_FOLDERS),
// que vivem no Drive de uma conta só. Por isso o app usa um único token — o do
// dono dessas pastas — em vez de exigir que cada professor autorize o Drive
// pessoal dele, que nem sequer é o destino dos arquivos.
export async function tokenDriveDaEscola(): Promise<string | null> {
  const emailDono = process.env.DRIVE_OWNER_EMAIL?.trim()

  if (emailDono) {
    const dono = await db.user.findUnique({
      where: { email: emailDono },
      select: { driveRefreshToken: true },
    })
    return dono?.driveRefreshToken ?? null
  }

  // Sem DRIVE_OWNER_EMAIL definido, usa a primeira conta que autorizou.
  const primeira = await db.user.findFirst({
    where: { driveRefreshToken: { not: null } },
    select: { driveRefreshToken: true },
    orderBy: { criadoEm: 'asc' },
  })
  return primeira?.driveRefreshToken ?? null
}
