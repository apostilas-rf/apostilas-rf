# 🧪 Guia Rápido de Teste - Apostilas RF

Execute estes passos para testar o ambiente após instalar Node.js.

## ✅ Pre-requisitos

Verifique que você tem:

```bash
node --version    # v18+ esperado
npm --version     # v9+ esperado
psql --version    # PostgreSQL 14+
```

---

## 🚀 Teste Rápido (5-10 minutos)

### Passo 1: Instalar dependências

```bash
cd /Users/giu/Desktop/apostilas-rf
npm install
```

**Tempo esperado**: 2-3 minutos
**Resultado esperado**: "up to date" ou dependências instaladas

---

### Passo 2: Configurar banco de dados

#### 2.1 Criar banco PostgreSQL

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Dentro do psql, execute:
CREATE DATABASE apostilas_rf;
\q
```

Ou usando comando direto:
```bash
createdb apostilas_rf
```

#### 2.2 Configurar .env.local

```bash
# Copiar template
cp .env.example .env.local

# Editar .env.local com seu editor favorito
# Procure por DATABASE_URL e atualize com suas credenciais:
# DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/apostilas_rf"
```

**Teste de conexão:**
```bash
psql -U seu_usuario -d apostilas_rf -c "SELECT 1;"
```

Se retornar `?column?` com valor `1`, está conectado! ✓

---

### Passo 3: Inicializar banco

```bash
npm run db:generate
```

**Esperado**: "Prisma client generated"

```bash
npm run db:migrate
```

**Esperado**: Migration inicial executada (pode dizer "Already up to date" se for primeira)

```bash
npm run db:seed
```

**Esperado**: 
```
✓ Usuário criado: gestor@rf.com.br
✓ Usuário criado: professor@rf.com.br
...
✅ Seed concluído com sucesso!
```

---

### Passo 4: Iniciar servidor

```bash
npm run dev
```

**Esperado**: 
```
 ▲ Next.js 14.x.x
 - Local:        http://localhost:3000
 - Environments: .env.local

✓ Ready in 2.5s
```

---

### Passo 5: Testar no navegador

1. **Abra**: http://localhost:3000
   - Deve ver página de boas-vindas com botão "Entrar na Plataforma"

2. **Clique em "Entrar na Plataforma"**
   - Deve ir para http://localhost:3000/auth/login

3. **Teste login como Gestor**:
   - Email: `gestor@rf.com.br`
   - Senha: `senha123`
   - Clique em "Entrar"

4. **Você deve ver o Dashboard**:
   - Navbar no topo com "Apostilas RF" e seu nome
   - Sidebar esquerda com menu
   - Painel central mostrando "Bem-vindo ao Dashboard"
   - Informações da sessão no card inferior

5. **Teste logout**:
   - Clique em seu avatar no Navbar
   - Clique em "Sair"
   - Deve voltar para login

---

## 🧪 Testes Específicos

### Teste 1: Autenticação
- [ ] Login com email/senha corretos → Dashboard ✓
- [ ] Login com senha errada → Erro "Email ou senha incorretos" ✓
- [ ] Logout → Volta para login ✓
- [ ] Acessar /dashboard sem login → Redireciona para login ✓

### Teste 2: RBAC (Role-Based Access Control)
```bash
# Login com diferentes usuários:
# gestor@rf.com.br → Deve ver menu "Usuários", "Templates", etc
# professor@rf.com.br → Deve ver menu "Minhas Apostilas"
# direcao@rf.com.br → Deve ver painel (read-only)
```

### Teste 3: Banco de Dados
```bash
npm run db:studio
```

Isso abre GUI do banco em http://localhost:5555. Você pode:
- Ver tabelas criadas
- Ver usuários de seed
- Ver estrutura de relacionamentos

### Teste 4: API (usando curl ou Postman)

```bash
# Teste login via API
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gestor@rf.com.br","senha":"senha123"}'

# Esperado: JSON com token e dados do usuário
```

---

## 🚨 Troubleshooting

### "Cannot find module 'next'"
```bash
npm install
npm run db:generate
```

### "Connection refused" (PostgreSQL)
```bash
# Verificar se PostgreSQL está rodando
pg_isready -h localhost -p 5432

# Se não estiver, inicie (macOS)
brew services start postgresql
```

### "P1000: Authentication failed"
- Verifique DATABASE_URL em .env.local
- Teste: `psql -U seu_usuario -d apostilas_rf`

### "ENOENT: no such file" (enviados)
```bash
cp .env.example .env.local
# Edite .env.local com suas credenciais
```

### Porta 3000 já em uso
```bash
# Matar processo na porta 3000
lsof -i :3000
kill -9 <PID>

# Ou usar porta diferente
PORT=3001 npm run dev
```

---

## ✨ Checklist de Teste

### Setup
- [ ] Node.js instalado (`node --version`)
- [ ] PostgreSQL rodando (`psql --version`)
- [ ] Dependências instaladas (`npm install`)
- [ ] .env.local criado e configurado
- [ ] Banco criado (`createdb apostilas_rf`)

### Inicialização
- [ ] `npm run db:generate` - OK
- [ ] `npm run db:migrate` - OK
- [ ] `npm run db:seed` - OK
- [ ] `npm run dev` - OK

### Funcionalidade
- [ ] Página inicial abrindo
- [ ] Login funcionando
- [ ] Dashboard visível após login
- [ ] Logout funcionando
- [ ] Acesso protegido funcionando
- [ ] Sidebar mostrando menu correto

### Performance
- [ ] Página inicial carrega em < 2s
- [ ] Login responde em < 1s
- [ ] Dashboard carrega em < 2s

---

## 📊 Comando de Referência Rápida

```bash
# Desenvolvimento
npm run dev              # Inicia servidor (http://localhost:3000)
npm run build            # Build para produção
npm run lint             # Verifica código

# Banco de dados
npm run db:generate      # Gera Prisma client
npm run db:migrate       # Executa migrations
npm run db:push          # Sincroniza schema
npm run db:studio        # Abre GUI do banco (http://localhost:5555)
npm run db:seed          # Popula com dados de teste

# Parar servidor
# Pressione Ctrl+C no terminal
```

---

## 🎯 Próximos Passos Após Teste

Se tudo passou:
1. ✅ Fazer uma ronda completa de testes
2. ✅ Explorar Prisma Studio (`npm run db:studio`)
3. ✅ Verificar que as 8 contas de teste existem
4. ✅ Começar **Fase 2: CRUD de Apostilas**

Se algo falhou:
1. Verificar logs em seu terminal
2. Consultar seção "Troubleshooting" acima
3. Editar .env.local se necessário
4. Reiniciar servidor com `npm run dev`

---

## 💡 Dicas

- **Deixe o servidor rodando** enquanto testa (não precisa reiniciar para mudanças CSS/JS)
- **Use DevTools** (F12) para ver erros no console do navegador
- **Verifique logs** do terminal para erros do servidor
- **Prisma Studio** é ótimo para entender o banco de dados

---

**Estimado**: 5-10 minutos de setup + 5 minutos de testes = ~15 minutos total

**Sucesso esperado**: 🎉 Dashboard rodando localmente com dados de teste

Boa sorte! 🚀
