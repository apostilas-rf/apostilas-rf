# Configuração Google OAuth

## 1. Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Clique em "Novo Projeto"
3. Nome: `Apostilas RF`
4. Clique em "Criar"

## 2. Habilitar OAuth 2.0

1. No menu lateral, vá para **APIs e Serviços**
2. Clique em **Biblioteca**
3. Procure por "Google+ API" e clique em **Habilitar**

## 3. Criar Credenciais OAuth

1. Vá para **APIs e Serviços** → **Credenciais**
2. Clique em **Criar Credenciais** → **ID de Cliente OAuth**
3. Se pedir, configure a tela de consentimento primeiro:
   - Tipo de usuário: **Externo**
   - Clique em **Criar**

### Configurar Tela de Consentimento

1. **Informações do Aplicativo**
   - Nome do aplicativo: `Apostilas RF`
   - Email de suporte do usuário: seu@email.com
   - Clique em **Salvar e Continuar**

2. **Escopos**
   - Adicione escopos: `openid`, `email`, `profile`
   - Clique em **Salvar e Continuar**

3. **Usuários de Teste**
   - Adicione seu email como testador
   - Clique em **Salvar e Continuar**

### Criar ID de Cliente

1. De volta em **Credenciais**, clique em **Criar Credenciais** → **ID de Cliente OAuth**
2. Tipo de aplicativo: **Aplicativo Web**
3. **URIs de redirecionamento autorizados** (IMPORTANTE):
   ```
   http://localhost:3000/api/auth/google-callback
   ```
4. Se for produção, adicione também:
   ```
   https://seu-dominio.com/api/auth/google-callback
   ```
5. Clique em **Criar**

## 4. Copiar Credenciais

Você verá uma modal com:
- **ID de Cliente**: copie isso
- **Senha do Cliente**: copie isso

## 5. Configurar Variáveis de Ambiente

No arquivo `.env.local`, adicione:

```env
# Google OAuth
GOOGLE_CLIENT_ID=<Cole aqui o ID de Cliente>
GOOGLE_CLIENT_SECRET=<Cole aqui a Senha do Cliente>
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google-callback
```

## 6. Testes

1. Acesse http://localhost:3000/auth/signup
2. Clique em "Continuar com Google"
3. Faça login com sua conta Google
4. Selecione as funções
5. Você deve ser redirecionado para `/auth/signup-pending`

## Troubleshooting

### Erro: "redirect_uri_mismatch"
- Verifique se a URI no Google Cloud Console **exatamente** combina com `GOOGLE_REDIRECT_URI`
- Não inclua barra final: `http://localhost:3000/api/auth/google-callback` ✅
- Não: `http://localhost:3000/api/auth/google-callback/` ❌

### Erro: "Invalid scope"
- Os escopos devem ser: `openid email profile`
- Verifique se estão habilitados na tela de consentimento

### Teste local não funciona
- Certifique-se de que o servidor está rodando em `http://localhost:3000`
- Você foi adicionado como "usuário de teste" na tela de consentimento?
