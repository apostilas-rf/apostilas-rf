import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  try {
    // Criar professor
    const senhaProf = await bcrypt.hash('senha123', 10)
    const professor = await db.user.upsert({
      where: { email: 'professor@test.com' },
      update: {},
      create: {
        email: 'professor@test.com',
        nome: 'João Professor',
        senha: senhaProf,
        role: 'PROFESSOR',
      },
    })
    console.log('Professor criado:', professor.id)

    // Criar diagramador
    const senhadiag = await bcrypt.hash('senha123', 10)
    const diagramador = await db.user.upsert({
      where: { email: 'diagramador@test.com' },
      update: {},
      create: {
        email: 'diagramador@test.com',
        nome: 'Maria Diagramadora',
        senha: senhadiag,
        role: 'DIAGRAMADOR',
      },
    })
    console.log('Diagramador criado:', diagramador.id)

    // Criar apostila
    const apostila = await db.apostila.create({
      data: {
        titulo: 'Apostila de Matemática',
        materia: 'Matemática',
        serie: 'PRIMEIRO_ANO',
        professorId: professor.id,
        status: 'DISTRIBUIDO',
      },
    })
    console.log('Apostila criada:', apostila.id)

    // Atribuir diagramação
    const atribuicao = await db.userAssignment.create({
      data: {
        usuarioId: diagramador.id,
        apostilaId: apostila.id,
        tarefa: 'DIAGRAMACAO',
      },
    })
    console.log('Atribuição criada:', atribuicao.id)

    // Criar arquivo de teste
    const arquivo = await db.apostilaArquivo.create({
      data: {
        apostilaId: apostila.id,
        tipo: 'PROFESSOR',
        nomeOriginal: 'Conteudo_Matematica.docx',
        nomeServidor: `${apostila.id}_PROFESSOR_test`,
        usuarioId: professor.id,
        googleDriveUrl: 'https://drive.google.com/file/d/test123/view',
      },
    })
    console.log('Arquivo criado:', arquivo.id)

    console.log('\n✅ Usuários de teste criados com sucesso!')
    console.log('Professor: professor@test.com / senha123')
    console.log('Diagramador: diagramador@test.com / senha123')
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await db.$disconnect()
  }
}

main()
