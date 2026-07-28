/**
 * Cria (ou ativa) o primeiro GESTOR da plataforma.
 *
 * Necessário porque `ativo` tem default `false` e o login por Google recusa
 * usuários inativos — sem este passo, um banco novo fica sem ninguém capaz
 * de aprovar os cadastros seguintes.
 *
 * Uso: node prisma/bootstrap-gestor.js seu-email@gmail.com "Seu Nome"
 */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  const nome = process.argv[3] || 'Gestor'

  if (!email || !email.includes('@')) {
    console.error('❌ Informe o email da conta Google que será o gestor.')
    console.error('   Uso: node prisma/bootstrap-gestor.js seu-email@gmail.com "Seu Nome"')
    process.exit(1)
  }

  const usuario = await prisma.user.upsert({
    where: { email },
    update: { role: 'GESTOR', ativo: true, aprovadoEm: new Date() },
    create: { email, nome, role: 'GESTOR', ativo: true, aprovadoEm: new Date() },
  })

  console.log(`✅ Gestor pronto: ${usuario.email} (ativo: ${usuario.ativo})`)
  console.log('   Faça login com "Entrar com Google" usando exatamente este email.')
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
