const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados anteriores (opcional)
  // await prisma.user.deleteMany({});
  // await prisma.apostila.deleteMany({});

  // Criar usuários de teste
  const usuarios = [
    {
      email: 'gestor@rf.com.br',
      nome: 'Gestor RF',
      role: 'GESTOR',
      senha: await bcrypt.hash('senha123', 10),
    },
    {
      email: 'professor@rf.com.br',
      nome: 'Professor Teste',
      role: 'PROFESSOR',
      senha: await bcrypt.hash('senha123', 10),
    },
    {
      email: 'diagramador@rf.com.br',
      nome: 'Diagramador Teste',
      role: 'DIAGRAMADOR',
      senha: await bcrypt.hash('senha123', 10),
    },
    {
      email: 'ilustrador@rf.com.br',
      nome: 'Ilustrador Teste',
      role: 'ILUSTRADOR',
      senha: await bcrypt.hash('senha123', 10),
    },
    {
      email: 'revisor@rf.com.br',
      nome: 'Revisor Teste',
      role: 'REVISOR',
      senha: await bcrypt.hash('senha123', 10),
    },
    {
      email: 'editor@rf.com.br',
      nome: 'Editor Teste',
      role: 'EDITOR',
      senha: await bcrypt.hash('senha123', 10),
    },
    {
      email: 'direcao@rf.com.br',
      nome: 'Direção RF',
      role: 'DIRECAO',
      senha: await bcrypt.hash('senha123', 10),
    },
  ];

  for (const usuario of usuarios) {
    const existing = await prisma.user.findUnique({
      where: { email: usuario.email },
    });

    if (!existing) {
      await prisma.user.create({
        data: usuario,
      });
      console.log(`✓ Usuário criado: ${usuario.email}`);
    } else {
      console.log(`ℹ Usuário já existe: ${usuario.email}`);
    }
  }

  // Criar templates
  const templates = [
    {
      titulo: 'Template 1º Ano',
      serie: 'PRIMEIRO_ANO',
      descricao: 'Template padrão para apostilas do 1º ano',
      estrutura: {
        capitulos_por_apostila: 3,
        paginas_por_capitulo_min: 10,
        paginas_por_capitulo_max: 50,
      },
    },
    {
      titulo: 'Template 2º Ano',
      serie: 'SEGUNDO_ANO',
      descricao: 'Template padrão para apostilas do 2º ano',
      estrutura: {
        capitulos_por_apostila: 3,
        paginas_por_capitulo_min: 10,
        paginas_por_capitulo_max: 50,
      },
    },
    {
      titulo: 'Template 3º Ano',
      serie: 'TERCEIRO_ANO',
      descricao: 'Template padrão para apostilas do 3º ano',
      estrutura: {
        capitulos_por_apostila: 3,
        paginas_por_capitulo_min: 10,
        paginas_por_capitulo_max: 50,
      },
    },
  ];

  for (const template of templates) {
    const existing = await prisma.template.findFirst({
      where: { titulo: template.titulo },
    });

    if (!existing) {
      await prisma.template.create({
        data: template,
      });
      console.log(`✓ Template criado: ${template.titulo}`);
    } else {
      console.log(`ℹ Template já existe: ${template.titulo}`);
    }
  }

  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
