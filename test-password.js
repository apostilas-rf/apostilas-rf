const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testPassword() {
  console.log('🔍 Testando senha do usuário gestor@rf.com.br...\n');

  // Buscar usuário
  const usuario = await prisma.user.findUnique({
    where: { email: 'gestor@rf.com.br' },
  });

  if (!usuario) {
    console.log('❌ Usuário não encontrado no banco de dados');
    console.log('   Execute: npm run db:seed');
    await prisma.$disconnect();
    return;
  }

  console.log('✓ Usuário encontrado:');
  console.log(`  - Email: ${usuario.email}`);
  console.log(`  - Nome: ${usuario.nome}`);
  console.log(`  - Role: ${usuario.role}`);
  console.log(`  - Ativo: ${usuario.ativo}`);
  console.log(`  - Hash armazenado: ${usuario.senha.substring(0, 20)}...`);
  console.log();

  // Testar comparação de senhas
  const senhaCorreta = 'senha123';
  const senhaErrada = 'senhaErrada';

  console.log('🔐 Testando verificação de senha...\n');

  const verificarCorreta = await bcrypt.compare(senhaCorreta, usuario.senha);
  console.log(`✓ Comparar "senha123": ${verificarCorreta ? '✅ CORRETO' : '❌ INCORRETO'}`);

  const verificarErrada = await bcrypt.compare(senhaErrada, usuario.senha);
  console.log(`✓ Comparar "senhaErrada": ${verificarErrada ? '❌ INCORRETO (deveria ser false)' : '✅ CORRETO (false)'}`);

  console.log();
  if (verificarCorreta) {
    console.log('✅ Senha está correta no banco!');
    console.log('   Tente fazer login novamente com:');
    console.log('   Email: gestor@rf.com.br');
    console.log('   Senha: senha123');
  } else {
    console.log('❌ Problema com a senha no banco');
    console.log('   Limpe a base e execute npm run db:seed novamente');
  }

  await prisma.$disconnect();
}

testPassword().catch((error) => {
  console.error('Erro:', error);
  process.exit(1);
});
