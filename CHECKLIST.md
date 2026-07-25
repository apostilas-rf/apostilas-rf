# Checklist - Apostilas RF

## 🚀 Inicialização do Ambiente

- [ ] Node.js 18+ instalado (`node --version`)
- [ ] PostgreSQL 14+ instalado e rodando
- [ ] Dependências instaladas (`npm install`)
- [ ] `.env.local` criado e configurado
- [ ] Banco de dados criado (`createdb apostilas_rf`)
- [ ] Prisma inicializado (`npm run db:generate`)
- [ ] Migrations executadas (`npm run db:migrate`)
- [ ] Seed dados de teste (`npm run db:seed`)

## ✅ Desenvolvimento - Fase 1 (Completada)

### Setup
- [x] Projeto Next.js criado
- [x] TypeScript configurado
- [x] Tailwind CSS com paleta RF
- [x] Estrutura de pastas organizada
- [x] Importa com @ aliases

### Banco de Dados
- [x] Prisma schema definido
- [x] 9 modelos criados
- [x] Relacionamentos configurados
- [x] Enums definidos
- [x] Índices adicionados
- [x] Script seed criado

### Autenticação
- [x] Hash de senha (bcrypt)
- [x] JWT creation/verification
- [x] Cookie HttpOnly
- [x] Middleware de proteção
- [x] API /api/auth/login
- [x] API /api/auth/logout
- [x] API /api/auth/me

### Frontend
- [x] Layout raiz criado
- [x] Página de login
- [x] Navbar com menu user
- [x] Sidebar com navegação
- [x] Dashboard layout
- [x] Dashboard inicial (page)
- [x] Proteção de rotas
- [x] Estilos base (Tailwind)

### Documentação
- [x] README.md
- [x] GETTING_STARTED.md
- [x] IMPLEMENTATION_STATUS.md
- [x] CHECKLIST.md

---

## 📅 Próximas Tarefas - Fase 2

### CRUD de Apostilas
- [ ] GET /api/apostilas - Listar com filtros e paginação
- [ ] POST /api/apostilas - Criar apostila nova
- [ ] GET /api/apostilas/:id - Ver detalhes
- [ ] PATCH /api/apostilas/:id - Editar
- [ ] DELETE /api/apostilas/:id - Deletar (soft delete)
- [ ] PATCH /api/apostilas/:id/status - Mudar status
- [ ] POST /api/apostilas/:id/assign - Atribuir tarefas
- [ ] GET /api/apostilas/:id/history - Ver histórico

### Componentes UI - Apostilas
- [ ] ApostilaTable - Tabela com sorting/filtering
- [ ] ApostilaForm - Formulário CRUD
- [ ] StatusBadge - Badge de status colorido
- [ ] StatusTimeline - Timeline de mudanças
- [ ] ProgressCard - Card com % conclusão

### Páginas Dashboard
- [ ] /dashboard - Home (resumo)
- [ ] /dashboard/apostilas - Lista completa
- [ ] /dashboard/apostilas/:id - Detalhes apostila
- [ ] /dashboard/minhas-apostilas - Filtrado por user
- [ ] /dashboard/professores - Fila professor (gestor)
- [ ] /dashboard/diagramadores - Fila diagramação
- [ ] /dashboard/revisores - Fila revisão

---

## 🔒 Fase 3 - Máquina de Estados

### Status Transitions
- [ ] RECEBIDO → EM_REVISAO_INICIAL
- [ ] EM_REVISAO_INICIAL → DISTRIBUIDO
- [ ] DISTRIBUIDO → EM_CONFECCAO
- [ ] EM_CONFECCAO → EM_REVISAO_POS_EDICAO
- [ ] EM_REVISAO_POS_EDICAO → EM_AJUSTE ou FINALIZADO
- [ ] EM_AJUSTE → EM_REVISAO_POS_EDICAO
- [ ] FINALIZADO → ENVIADO_GRAFICA

### Validações
- [ ] Apenas GESTOR pode mudar status inicial
- [ ] Apenas REVISOR pode aprovar/devolver
- [ ] Apenas EDITOR pode finalizar
- [ ] Validar atribuições completas antes de mudar status

### Histórico
- [ ] Registrar quem fez cada mudança
- [ ] Registrar data/hora
- [ ] Registrar descrição/motivo
- [ ] Endpoint GET /api/apostilas/:id/history

---

## 📤 Fase 4 - Upload Google Drive

### Google Drive Integration
- [ ] Configurar Google Drive API
- [ ] Service Account OAuth2
- [ ] Criar pasta raiz
- [ ] Criar subpastas por série

### Upload Files
- [ ] POST /api/upload - Endpoint upload
- [ ] Validação tipo arquivo
- [ ] Validação tamanho (50MB max)
- [ ] Upload para Google Drive
- [ ] Armazenar metadata no DB
- [ ] Retornar link público

### Download Files
- [ ] GET /api/apostilas/:id/download/:fileId
- [ ] Redirecionar para Google Drive
- [ ] Log de download

---

## 🔔 Fase 5 - Notificações

### In-App
- [ ] Badge de não-lidas no header
- [ ] GET /api/notificacoes
- [ ] PATCH /api/notificacoes/:id/read
- [ ] Toast de notificações novas
- [ ] Página de notificações

### Email
- [ ] Configurar SMTP (Nodemailer)
- [ ] Template "Apostila Atribuída"
- [ ] Template "Status Mudou"
- [ ] Template "Revisão Finalizada"
- [ ] Template "Comentário Adicionado"
- [ ] Enviar email ao mudar status

### Eventos
- [ ] Notificar ao atribuir tarefa
- [ ] Notificar ao mudar status
- [ ] Notificar ao adicionar comentário
- [ ] Notificar conclusão de etapa

---

## 📊 Fase 6 - Dashboard Completo

### Painel Principal
- [ ] Cards de resumo por série
- [ ] Gráfico de % conclusão
- [ ] Lista de apostilas com status
- [ ] Histórico de atividades recentes
- [ ] Alertas de atraso

### Filtros Avançados
- [ ] Filtrar por série
- [ ] Filtrar por status
- [ ] Filtrar por matéria
- [ ] Filtrar por professor
- [ ] Filtrar por data
- [ ] Busca por nome/título

### Visualizações
- [ ] Gráfico de Gantt (prazos)
- [ ] Heatmap de progresso
- [ ] Cards de KPI
- [ ] Tabela responsiva
- [ ] Paginação

---

## 🛠️ Utilitários e Melhorias

### Performance
- [ ] Implementar cache (Redis ou memory)
- [ ] Otimizar queries (N+1)
- [ ] Lazy load de imagens
- [ ] Code splitting

### Testing
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Testes E2E (Cypress/Playwright)
- [ ] Coverage > 80%

### Segurança
- [ ] Rate limiting na API
- [ ] Validação CSRF
- [ ] Sanitização de input
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] HTTPS em produção

### Observabilidade
- [ ] Logging centralizado
- [ ] Error tracking (Sentry)
- [ ] Monitoring de performance
- [ ] Analytics

---

## 🎯 Checkpoints Importantes

### Antes de iniciar Fase 2
- [ ] Environment totalmente configurado
- [ ] Banco de dados funcionando
- [ ] Login funcionando com seed users
- [ ] Dashboard abrindo sem erros

### Antes de Fase 3
- [ ] CRUD de apostilas 100% funcionando
- [ ] Componentes de UI testados
- [ ] Paginação e filtros funcionando

### Antes de Fase 4
- [ ] Google Drive API configurada
- [ ] Credenciais seguras em .env.local
- [ ] Teste manual de upload

### Antes de Fase 5
- [ ] SMTP configurado
- [ ] Template emails criados
- [ ] Eventos disparam corretamente

### Antes de Produção
- [ ] Testes automatizados passando
- [ ] Performance otimizada
- [ ] Segurança auditada
- [ ] Documentação atualizada

---

## 🚀 Deploy

### Staging
- [ ] Build sucedido
- [ ] All tests passing
- [ ] Performance acceptable
- [ ] Security scan passed

### Production
- [ ] Database backup configured
- [ ] Error monitoring active
- [ ] CDN configured (se necessário)
- [ ] SSL certificate valid
- [ ] Monitoring dashboards set up
- [ ] Rollback plan documented

---

## 📝 Notas

**Iniciado em**: 2026-07-24
**Versão Atual**: v0.1.0-alpha
**Última Atualização**: 2026-07-24

Use este checklist para acompanhar o progresso. Marque as caixas conforme completa cada tarefa! ✅

