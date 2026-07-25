import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  try {
    const senhaGestor = await bcrypt.hash('senha123', 10)
    const gestor = await db.user.upsert({
      where: { email: 'gestor@test.com' },
      update: {},
      create: {
        email: 'gestor@test.com',
        nome: 'Gestor RF',
        senha: senhaGestor,
        role: 'GESTOR',
      },
    })
    console.log('Gestor criado:', gestor.id)
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await db.$disconnect()
  }
}

main()
