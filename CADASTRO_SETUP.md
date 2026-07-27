# Setup Completo - Sistema de Cadastro com Google OAuth

## ✅ Já Implementado

### 1. Backend
- [x] Modelo `UserRole` para múltiplas funções por usuário
- [x] Endpoint `/api/auth/google-signup` - iniciar fluxo OAuth
- [x] Endpoint `/api/auth/google-callback` - processar callback do Google
- [x] Validação: usuários novos começam como `ativo: false`
- [x] Endpoints de admin: aprovar/rejeitar cadastros
- [x] Alteração de login: bloqueia usuários inativos

### 2. Frontend
- [x] Página `/auth/signup` - seleção de 1-2 funções
- [x] Página `/auth/signup-pending` - aguardando aprovação
- [x] Painel `/dashboard/admin-cadastros` - gestão de cadastros
- [x] Link de cadastro na página de login

### 3. Database
- [x] Migration criada em `prisma/migrations/add_oauth_and_user_roles/migration.sql`

---

## 🚀 Próximas Etapas

### Passo 1: Configurar Google OAuth (FAZER NO SEU COMPUTADOR)

Siga o guia em `SETUP_GOOGLE_OAUTH.md`:
1. Acesse Google Cloud Console
2. Crie um novo projeto
3. Habilite OAuth 2.0
4. Crie credenciais
5. Adicione `.env.local` com as chaves

### Passo 2: Executar Migration (NO TERMINAL)

```bash
cd /Users/giu/dev/apostilas-rf
npx prisma migrate deploy
```

Ou se quiser que Prisma gere a migration automaticamente:

```bash
npx prisma migrate dev
```

### Passo 3: Testar Fluxo Completo

1. **Servidor rodando:** `npm run dev` (já deve estar)
2. **Acessar:** http://localhost:3000/auth/signup
3. **Selecionar funções** e clicar "Continuar com Google"
4. **Fazer login** com conta Gmail
5. **Ver mensagem:** "Cadastro Pendente"
6. **Como Gestor:** Ir para http://localhost:3000/dashboard/admin-cadastros
7. **Aprovar o cadastro**
8. **Novo usuário:** Fazer login com email Google

---

## 📝 Estrutura de Dados

### User (Alterado)
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  nome          String
  senha         String?   // NULL para Google OAuth
  role          Role      @default(PROFESSOR) // Role principal
  googleId      String?   @unique // Para OAuth
  ativo         Boolean   @default(false) // Precisa aprovação
  aprovadoEm    DateTime? // Quando foi aprovado
  criadoEm      DateTime  @default(now())
  
  rolesAdicionais UserRole[]
  // ... outras relations
}
```

### UserRole (Nova)
```prisma
model UserRole {
  id        String   @id @default(cuid())
  usuarioId String
  usuario   User     @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  role      Role     // Role adicional
  criadoEm  DateTime @default(now())
  
  @@unique([usuarioId, role])
}
```

---

## 🔐 Segurança

- ✅ State CSRF protection (cookies httpOnly)
- ✅ Usuários começam inativos (aprovação necessária)
- ✅ Senha opcional (Google OAuth não a possui)
- ✅ Roles persistidas no banco (não apenas em token)
- ⚠️ TODO: Email de aprovação quando gestor aprova

---

## 🐛 Troubleshooting

**Erro: "Google OAuth não configurado"**
- Cheque se `.env.local` tem `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`

**Erro: "redirect_uri_mismatch"**
- A URI no Google Cloud deve ser **exatamente**: `http://localhost:3000/api/auth/google-callback`

**Usuários Google tentam login com senha**
- Endpoint de login detecta `senha: NULL` e retorna "Use o login com Google"

**Migration falha**
- Certifique-se de que o banco está rodando
- Verifique `DATABASE_URL` no `.env.local`

---

## 📊 Fluxo Visual

```
┌─────────────────────────────────────────────────────────┐
│                  Novo Usuário                           │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
    ┌───────────────────┐
    │ /auth/signup      │
    │ Seleciona funções │
    └────────┬──────────┘
             │
             ▼
    ┌────────────────────────────┐
    │ Google OAuth Login         │
    │ (google-signup endpoint)   │
    └────────┬───────────────────┘
             │
             ▼
    ┌────────────────────────────┐
    │ Criar usuário no banco     │
    │ ativo: false               │
    │ (google-callback endpoint) │
    └────────┬───────────────────┘
             │
             ▼
    ┌────────────────────────────┐
    │ /auth/signup-pending       │
    │ "Aguardando aprovação"     │
    └────────┬───────────────────┘
             │
             ▼ (Gestor aprova)
    ┌────────────────────────────┐
    │ /dashboard/admin-cadastros │
    │ Clica em ✅ Aprovar        │
    └────────┬───────────────────┘
             │
             ▼
    ┌────────────────────────────┐
    │ User.ativo = true          │
    │ User.aprovadoEm = now()    │
    │ Email enviado (TODO)       │
    └────────┬───────────────────┘
             │
             ▼
    ┌────────────────────────────┐
    │ /auth/login                │
    │ Faz login com Google       │
    │ Acessa dashboard ✅        │
    └────────────────────────────┘
```

---

## ✨ Próximas Melhorias (Futuro)

- [ ] Enviar email de aprovação
- [ ] Enviar email de rejeição
- [ ] Dashboard do usuário mostrar status de aprovação
- [ ] Permitir admin editar roles após aprovação
- [ ] Log de aprovações/rejeições
- [ ] Notificação quando novo cadastro chega

---

Pronto para configurar o Google OAuth? 🚀
