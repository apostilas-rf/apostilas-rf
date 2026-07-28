#!/usr/bin/env node
/**
 * Aplica as migrations pendentes no banco de PRODUÇÃO.
 *
 * Existe para que rodar migration em produção seja sempre um ato deliberado:
 * o .env do projeto aponta para o banco local, então nenhum comando comum do
 * Prisma alcança o Supabase por acidente.
 *
 * Uso: npm run db:migrate:prod
 */
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')
const readline = require('readline')

const ARQUIVO = path.join(__dirname, '..', '.env.production.local')

function carregarCredenciais() {
  if (!fs.existsSync(ARQUIVO)) {
    console.error('❌ .env.production.local não encontrado.')
    console.error('   Copie DATABASE_URL e DIRECT_URL das variáveis do projeto na Vercel.')
    process.exit(1)
  }

  const env = {}
  for (const linha of fs.readFileSync(ARQUIVO, 'utf8').split('\n')) {
    if (!linha.includes('=') || linha.trim().startsWith('#')) continue
    const i = linha.indexOf('=')
    env[linha.slice(0, i).trim()] = linha.slice(i + 1).trim().replace(/^"|"$/g, '')
  }

  if (!env.DATABASE_URL || !env.DIRECT_URL) {
    console.error('❌ .env.production.local precisa conter DATABASE_URL e DIRECT_URL.')
    process.exit(1)
  }
  return env
}

function hostDe(url) {
  try {
    return new URL(url).host
  } catch {
    return '(url inválida)'
  }
}

async function confirmar(pergunta) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const resposta = await new Promise((r) => rl.question(pergunta, r))
  rl.close()
  return resposta.trim().toLowerCase() === 's'
}

;(async () => {
  const env = carregarCredenciais()

  console.log('⚠️  Isto vai aplicar migrations no banco de PRODUÇÃO:')
  console.log(`   ${hostDe(env.DIRECT_URL)}\n`)

  if (!(await confirmar('Continuar? (s/N) '))) {
    console.log('Cancelado.')
    process.exit(0)
  }

  try {
    execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: env.DATABASE_URL, DIRECT_URL: env.DIRECT_URL },
    })
  } catch {
    process.exit(1)
  }
})()
