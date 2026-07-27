import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { enviarEmail, templateAlertaPrazoProximo, templateAlertaPrazoVencido } from '@/lib/email'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const userRole = headersList.get('x-user-role')

    // Apenas GESTOR pode disparar verificação de alertas
    if (userRole !== 'GESTOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const hoje = new Date()
    const alertasEnviados = []
    const alertasErro = []

    // Buscar apostilas em produção com prazos definidos
    const apostilas = await db.apostila.findMany({
      where: {
        status: {
          notIn: ['ENVIADO', 'FINALIZADO'],
        },
        dataFinal: {
          not: null,
        },
      },
      include: {
        professor: {
          select: { id: true, nome: true, email: true },
        },
        atribuicoes: {
          include: {
            usuario: {
              select: { id: true, nome: true, email: true, role: true },
            },
          },
        },
      },
    })

    for (const apostila of apostilas) {
      const dataFinal = new Date(apostila.dataFinal!)
      const diasRestantes = Math.ceil(
        (dataFinal.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Determinar tipo de alerta
      let tipoAlerta = ''
      let devEnviar = false

      if (diasRestantes < 0) {
        tipoAlerta = 'PRAZO_VENCIDO'
        devEnviar = true
      } else if (diasRestantes <= 3) {
        tipoAlerta = 'PRAZO_CRITICO'
        devEnviar = true
      } else if (diasRestantes <= 7) {
        tipoAlerta = 'PRAZO_PROXIMO'
        devEnviar = true
      }

      if (!devEnviar) continue

      // Verificar se alerta já foi enviado hoje
      const alertaJaEnviado = await db.alertaEmail.findFirst({
        where: {
          apostilaId: apostila.id,
          tipo: tipoAlerta,
          criadoEm: {
            gte: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()),
            lt: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1),
          },
        },
      })

      if (alertaJaEnviado) {
        continue // Alerta já foi enviado hoje, pular
      }

      // Enviar alerta para gestor e atribuições relevantes
      const destinatarios = new Set<{ nome: string; email: string }>()

      // Adicionar gestor
      const gestores = await db.user.findMany({
        where: { role: 'GESTOR' },
        select: { nome: true, email: true },
      })

      gestores.forEach((g) => {
        if (g.email) destinatarios.add(g)
      })

      // Adicionar atribuições relevantes (diagramadores, revisores)
      apostila.atribuicoes.forEach((atrib) => {
        if (atrib.usuario.email && ['DIAGRAMADOR', 'REVISOR'].includes(atrib.usuario.role)) {
          destinatarios.add({ nome: atrib.usuario.nome, email: atrib.usuario.email })
        }
      })

      // Enviar emails
      for (const destinatario of destinatarios) {
        try {
          let html = ''
          let assunto = ''

          const dataFormatada = dataFinal.toLocaleDateString('pt-BR')

          if (diasRestantes < 0) {
            assunto = `🚨 CRÍTICO: Apostila "${apostila.titulo}" vencida há ${Math.abs(diasRestantes)} dias`
            html = templateAlertaPrazoVencido(
              destinatario.nome,
              apostila.titulo,
              Math.abs(diasRestantes),
              dataFormatada
            )
          } else {
            assunto = `⏰ Alerta: Apostila "${apostila.titulo}" vence em ${diasRestantes} dias`
            html = templateAlertaPrazoProximo(
              destinatario.nome,
              apostila.titulo,
              diasRestantes,
              dataFormatada
            )
          }

          const resultado = await enviarEmail({
            para: destinatario.email,
            assunto,
            html,
          })

          if (resultado.success) {
            // Registrar alerta enviado
            await db.alertaEmail.upsert({
              where: {
                usuarioId_apostilaId_tipo: {
                  usuarioId: (await db.user.findFirst({
                    where: { email: destinatario.email },
                    select: { id: true },
                  }))?.id || 'unknown',
                  apostilaId: apostila.id,
                  tipo: tipoAlerta,
                },
              },
              update: { criadoEm: new Date() },
              create: {
                usuarioId: (await db.user.findFirst({
                  where: { email: destinatario.email },
                  select: { id: true },
                }))?.id || 'unknown',
                apostilaId: apostila.id,
                tipo: tipoAlerta,
                diasRestantes,
                emailEnviado: destinatario.email,
                enviado: true,
              },
            })

            alertasEnviados.push({
              apostila: apostila.titulo,
              tipo: tipoAlerta,
              para: destinatario.email,
            })
          } else {
            alertasErro.push({
              apostila: apostila.titulo,
              para: destinatario.email,
              erro: resultado.error,
            })
          }
        } catch (err) {
          alertasErro.push({
            apostila: apostila.titulo,
            para: destinatario.email,
            erro: err,
          })
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        totalVerificadas: apostilas.length,
        alertasEnviados: alertasEnviados.length,
        alertasErro: alertasErro.length,
        detalhes: {
          enviados: alertasEnviados,
          erros: alertasErro,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao verificar e enviar alertas:', error)
    return NextResponse.json(
      { error: 'Erro ao processar alertas', detalhes: error },
      { status: 500 }
    )
  }
}
