# Apostilas RF - Plataforma de Produção

Plataforma web para gerenciar todo o ciclo de vida de produção de apostilas escolares (ensino médio + cursinho), desde o recebimento do material bruto até o envio à gráfica.

## Stack Tecnológico

- **Frontend + Backend**: Next.js 14+ (TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Armazenamento**: Google Drive
- **Notificações**: Email (Nodemailer) + In-app
- **Estilos**: Tailwind CSS

## Instalação

### Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL 14+ instalado e rodando
- Conta Google com Google Drive API habilitada

### Passos

1. **Instalar dependências**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**
   ```bash
   cp .env.local.example .env.local
   # Editar .env.local com suas configurações
   ```

3. **Setup do banco de dados**
   ```bash
   npm run db:generate   # Gerar Prisma client
   npm run db:migrate    # Executar migrations
   npm run db:seed       # (Opcional) Popular com dados de teste
   ```

4. **Iniciar o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

   Acesse em: `http://localhost:3000`

## Variáveis de Ambiente

Copie as variáveis de `.env.local` e preencha com seus valores:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/apostilas_rf"

# JWT
JWT_SECRET="sua-chave-secreta-aqui"

# Google Drive
GOOGLE_DRIVE_API_KEY="sua-api-key"
GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL="seu-service-account@projeto.iam.gserviceaccount.com"
GOOGLE_DRIVE_PRIVATE_KEY="sua-chave-privada"
GOOGLE_DRIVE_FOLDER_ID="id-da-pasta"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-app"
SMTP_FROM="apostilas@rfducacao.com.br"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Verifica linting
- `npm run db:generate` - Gera Prisma client
- `npm run db:migrate` - Executa migrations
- `npm run db:push` - Sincroniza schema com banco
- `npm run db:studio` - Abre Prisma Studio (GUI do banco)
- `npm run db:seed` - Popula banco com dados de teste

## Estrutura de Pastas

```
apostilas-rf/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── auth/           # Páginas de autenticação
│   │   ├── dashboard/      # Páginas protegidas
│   │   ├── globals.css     # Estilos globais
│   │   └── layout.tsx      # Layout raiz
│   ├── components/         # Componentes React
│   ├── lib/                # Utilitários (auth, db, email, etc)
│   ├── types/              # Tipos TypeScript
│   └── middleware.ts       # Middleware de autenticação
├── prisma/
│   └── schema.prisma       # Schema do banco
└── public/                 # Assets estáticos
```

## Fluxo de Desenvolvimento

### Fase 1: Setup (Completo ✓)
- [x] Criação do projeto Next.js
- [x] Configuração do Tailwind e TypeScript
- [x] Schema Prisma com todos os modelos
- [x] Tipos TypeScript
- [x] Autenticação básica (login/logout)
- [x] Middleware de proteção de rotas
- [x] Layout dashboard com sidebar

### Fase 2: CRUD de Apostilas (Próximo)
- [ ] API GET /api/apostilas (listar com filtros)
- [ ] API POST /api/apostilas (criar)
- [ ] API GET /api/apostilas/:id (detalhes)
- [ ] API PATCH /api/apostilas/:id/status (mudar status)
- [ ] Componentes de UI para CRUD

### Fase 3: Upload Google Drive
- [ ] Integração Google Drive API
- [ ] Upload de arquivos
- [ ] Gerenciamento de arquivos

### Fase 4: Sistema de Notificações
- [ ] Notificações in-app
- [ ] Envio de emails
- [ ] Templates de email

### Fase 5: Dashboard Completo
- [ ] Painel de acompanhamento
- [ ] Gráficos e métricas
- [ ] Filtros avançados

## Usuários de Teste

Após executar `npm run db:seed`, você terá acesso com:

- **Gestor**: gestor@rf.com.br / senha123
- **Professor**: professor@rf.com.br / senha123
- **Diagramador**: diagramador@rf.com.br / senha123
- **Ilustrador**: ilustrador@rf.com.br / senha123
- **Revisor**: revisor@rf.com.br / senha123

## Troubleshooting

### Erro: "node-postgres" não encontrado
```bash
npm install pg @types/pg
```

### Erro de conexão com PostgreSQL
- Verifique se PostgreSQL está rodando: `pg_isready`
- Valide DATABASE_URL em `.env.local`

### Erro: "Module not found: '@/lib/db'"
```bash
npm run db:generate
```

## Documentação

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Licença

Proprietário: RF Educação
