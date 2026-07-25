import nodemailer from 'nodemailer'

// Configurar transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface EmailParams {
  para: string
  assunto: string
  html: string
}

export async function enviarEmail({ para, assunto, html }: EmailParams) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'RF Apostilas'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: para,
      subject: assunto,
      html,
    })

    console.log('Email enviado:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return { success: false, error }
  }
}

// Templates de Email
export function templateApostilaAtribuida(
  nomeUsuario: string,
  tituloApostila: string,
  serie: string,
  prazo: string
) {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nova Apostila Atribuída</title>
      <style>
        body { font-family: 'Open Sans', sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #009B60; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
        .button { display: inline-block; background-color: #009B60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nova Apostila Atribuída</h1>
        </div>
        <div class="content">
          <p>Olá <strong>${nomeUsuario}</strong>,</p>
          <p>Você foi atribuído para trabalhar na seguinte apostila:</p>

          <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #009B60;">
            <p><strong>📚 ${tituloApostila}</strong></p>
            <p>Série: ${serie}</p>
            <p>Prazo: <strong>${prazo}</strong></p>
          </div>

          <p>Acesse a plataforma para visualizar mais detalhes e começar o trabalho.</p>

          <a href="${process.env.APP_URL}/dashboard/apostilas" class="button">Acessar Plataforma</a>
        </div>
        <div class="footer">
          <p>© 2024 RF Apostilas. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function templateStatusMudou(
  nomeUsuario: string,
  tituloApostila: string,
  statusAnterior: string,
  statusNovo: string,
  descricao?: string
) {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Status de Apostila Alterado</title>
      <style>
        body { font-family: 'Open Sans', sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #003333; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
        .button { display: inline-block; background-color: #009B60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        .status-box { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Status Alterado</h1>
        </div>
        <div class="content">
          <p>Olá <strong>${nomeUsuario}</strong>,</p>
          <p>O status da seguinte apostila foi alterado:</p>

          <div class="status-box">
            <p><strong>📄 ${tituloApostila}</strong></p>
            <p>Status anterior: <span style="background: #fee; padding: 2px 8px; border-radius: 3px;">${statusAnterior}</span></p>
            <p>Novo status: <span style="background: #efe; padding: 2px 8px; border-radius: 3px;">${statusNovo}</span></p>
            ${descricao ? `<p><strong>Observação:</strong> ${descricao}</p>` : ''}
          </div>

          <a href="${process.env.APP_URL}/dashboard/apostilas" class="button">Ver Detalhes</a>
        </div>
        <div class="footer">
          <p>© 2024 RF Apostilas. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function templateRevisaoFinalizada(
  nomeUsuario: string,
  tituloApostila: string,
  status: 'aprovada' | 'devolvida',
  comentario?: string
) {
  const titulo = status === 'aprovada' ? '✅ Apostila Aprovada' : '📝 Apostila Devolvida'
  const cor = status === 'aprovada' ? '#009B60' : '#FF6B6B'

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${titulo}</title>
      <style>
        body { font-family: 'Open Sans', sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: ${cor}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
        .button { display: inline-block; background-color: ${cor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${titulo}</h1>
        </div>
        <div class="content">
          <p>Olá <strong>${nomeUsuario}</strong>,</p>
          <p>A revisão da sua apostila foi finalizada:</p>

          <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid ${cor};">
            <p><strong>📚 ${tituloApostila}</strong></p>
            ${status === 'aprovada'
              ? '<p>Sua apostila foi <strong>aprovada</strong> e está pronta para o próximo estágio!</p>'
              : '<p>Sua apostila foi <strong>devolvida</strong> para ajustes.</p>'
            }
            ${comentario ? `<p><strong>Comentário:</strong> ${comentario}</p>` : ''}
          </div>

          <a href="${process.env.APP_URL}/dashboard/apostilas" class="button">Acessar Plataforma</a>
        </div>
        <div class="footer">
          <p>© 2024 RF Apostilas. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function templateProblemaRelatado(
  nomeProfessor: string,
  tituloApostila: string,
  descricaoProblema: string,
  nomeDiagramador: string
) {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Problema na Diagramação</title>
      <style>
        body { font-family: 'Open Sans', sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FF9500; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
        .button { display: inline-block; background-color: #009B60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        .problem-box { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #FF9500; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Problema na Diagramação</h1>
        </div>
        <div class="content">
          <p>Olá <strong>${nomeProfessor}</strong>,</p>
          <p><strong>${nomeDiagramador}</strong> relatou um problema na diagramação:</p>

          <div class="problem-box">
            <p><strong>📚 ${tituloApostila}</strong></p>
            <p><strong>Problema:</strong></p>
            <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin: 10px 0;">
              ${descricaoProblema}
            </p>
          </div>

          <p>Acesse a plataforma para visualizar o problema e fornecer uma resposta ao diagramador.</p>

          <a href="${process.env.APP_URL}/dashboard/apostilas" class="button">Ver Problemas</a>
        </div>
        <div class="footer">
          <p>© 2024 RF Apostilas. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function templateRespostaProblemaDiagramacao(
  nomeDiagramador: string,
  tituloApostila: string,
  descricaoProblema: string,
  respostaProf: string,
  nomeProfessor: string
) {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Resposta do Professor</title>
      <style>
        body { font-family: 'Open Sans', sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #009B60; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
        .button { display: inline-block; background-color: #009B60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        .response-box { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #009B60; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Resposta do Professor</h1>
        </div>
        <div class="content">
          <p>Olá <strong>${nomeDiagramador}</strong>,</p>
          <p><strong>${nomeProfessor}</strong> respondeu ao seu problema:</p>

          <div class="response-box">
            <p><strong>📚 ${tituloApostila}</strong></p>
            <p><strong>Seu problema:</strong></p>
            <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin: 10px 0; color: #666;">
              ${descricaoProblema}
            </p>
            <p><strong>Resposta do professor:</strong></p>
            <p style="background: #efe; padding: 10px; border-radius: 4px; margin: 10px 0;">
              ${respostaProf}
            </p>
          </div>

          <p>Acesse a plataforma para ver mais detalhes.</p>

          <a href="${process.env.APP_URL}/dashboard/diagramadores" class="button">Acessar Plataforma</a>
        </div>
        <div class="footer">
          <p>© 2024 RF Apostilas. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
