# Guia de Inicialização - Apostilas RF

Siga este guia passo a passo para configurar e iniciar a plataforma.

## Pré-requisitos

Certifique-se de que você tem instalado:

- **Node.js 18+**: [Download](https://nodejs.org/)
- **PostgreSQL 14+**: [Download](https://www.postgresql.org/download/)
- **Git** (opcional): [Download](https://git-scm.com/)

Verificar instalação:
```bash
node --version
npm --version
psql --version
```

## Passo 1: Clonar/Baixar o Projeto

```bash
cd /Users/giu/Desktop
# Projeto já está em apostilas-rf/
cd apostilas-rf
```

## Passo 2: Instalar Dependências

```bash
npm install
```

Isso vai levar alguns minutos. Aguarde...

## Passo 3: Configurar o Banco de Dados

### 3.1 Criar banco PostgreSQL

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Dentro do psql:
CREATE DATABASE apostilas_rf;
\q
```

Ou use um cliente gráfico (pgAdmin, DBeaver, etc).

### 3.2 Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env.local

# Editar .env.local com suas configurações
# Abra o arquivo e atualize:
# - DATABASE_URL: "postgresql://seu_usuario:sua_senha@localhost:5432/apostilas_rf"
# - JWT_SECRET: gere uma chave segura (pode usar: `openssl rand -base64 32`)
```

**Exemplo de DATABASE_URL válido:**
```
postgresql://postgres:sua_senha@localhost:5432/apostilas_rf
```

### 3.3 Executar Prisma

```bash
# Gerar Prisma client
npm run db:generate

# Executar migrations (criar tabelas)
npm run db:migrate

# Popular banco com dados de teste
npm run db:seed
```

Se tudo correr bem, você verá:
```
✓ Usuário criado: gestor@rf.com.br
✓ Usuário criado: professor@rf.com.br
...
✅ Seed concluído com sucesso!
```

## Passo 4: Iniciar o Servidor

```bash
npm run dev
```

Você deverá ver algo como:
```
 ▲ Next.js 14.0.0
 - Local:        http://localhost:3000
 - Environments: .env.local

✓ Ready in 2.5s
```

## Passo 5: Acessar a Aplicação

1. Abra o navegador e acesse: **http://localhost:3000**
2. Clique em "Entrar na Plataforma"
3. Use uma das contas de teste:

| Email | Senha | Perfil |
|-------|-------|--------|
| gestor@rf.com.br | senha123 | Gestor (admin) |
| professor@rf.com.br | senha123 | Professor |
| diagramador@rf.com.br | senha123 | Diagramador |
| ilustrador@rf.com.br | senha123 | Ilustrador |
| revisor@rf.com.br | senha123 | Revisor |
| editor@rf.com.br | senha123 | Editor |
| direcao@rf.com.br | senha123 | Direção (view-only) |

## Passo 6 (Opcional): Explorar o Banco de Dados

```bash
npm run db:studio
```

Isso abre Prisma Studio em `http://localhost:5555`, onde você pode:
- Ver todos os dados
- Criar/editar registros
- Entender a estrutura do banco

## Troubleshooting

### Erro: "Cannot find module 'postgres'"
```bash
npm install
```

### Erro: "connection refused" (banco de dados)
```bash
# Verificar se PostgreSQL está rodando
pg_isready -h localhost -p 5432

# Se não estiver, inicie:
# macOS (Homebrew)
brew services start postgresql

# Windows
# Use o pgAdmin ou Services panel
```

### Erro: "P1000: Authentication failed"
- Verifique DATABASE_URL em `.env.local`
- Certifique-se de que o usuário PostgreSQL existe
- Teste a conexão: `psql -U seu_usuario -d apostilas_rf`

### Erro: "ENOENT: no such file or directory, open '.env.local'"
```bash
cp .env.example .env.local
# Edite o arquivo com suas configurações
```

## Próximos Passos

1. **Explorar o dashboard**: Faça login e navegue pelas diferentes seções
2. **Entender a estrutura**: Veja a pasta `src/` e `prisma/schema.prisma`
3. **Continuar desenvolvimento**: 
   - Fase 2: CRUD de apostilas
   - Fase 3: Upload Google Drive
   - Fase 4: Notificações
   - Fase 5: Dashboard completo

## Scripts Úteis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor dev

# Build
npm run build        # Build para produção
npm run start        # Inicia server de produção

# Banco de dados
npm run db:generate  # Gera Prisma client
npm run db:migrate   # Cria/executa migrations
npm run db:push      # Sincroniza schema com BD
npm run db:studio    # Abre GUI do banco
npm run db:seed      # Popula com dados de teste

# Qualidade
npm run lint         # Verifica linting
```

## Estrutura Básica

```
apostilas-rf/
├── src/
│   ├── app/          # Páginas e rotas
│   ├── components/   # Componentes React
│   ├── lib/          # Lógica compartilhada
│   └── types/        # Tipos TypeScript
├── prisma/
│   └── schema.prisma # Definição do banco
└── package.json
```

## Documentação Útil

- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma ORM](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/)

## Suporte

Se encontrar problemas:

1. Verifique este guia novamente
2. Veja a seção Troubleshooting
3. Consulte o README.md

**Bom desenvolvimento! 🚀**
