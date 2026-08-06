import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { enviarEmail, templateAlertaPrazoProximo, templateAlertaPrazoVencido } from '@/lib/email'
import { ETAPA_LABEL, diasAte, type Etapa } from '@/lib/etapas'

// Roda sem sessão de usuário: o Vercel Cron chama com
// `Authorization: Bearer $CRON_SECRET`. A rota de alertas que já existia exigia
// x-user-role GESTOR, e é por isso que nunca pôde ser automática.
function autorizado(request: NextRequest) {
  const segredo = process.env.CRON_SECRET
  // Sem segredo configurado a rota fica fechada, em vez de aberta a qualquer um.
  if (!segredo) return false
  return request.headers.get('authorization') === `Bearer ${segredo}`
}

export async function GET(request: NextRequest) {
  if (!autorizado(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const hoje = new Date()
    const inicioDoDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())

    const prazos = await db.deadline.findMany({
      where: { concluido: false },
      include: {
        apostila: { select: { id: true, titulo: true } },
        responsavel: { select: { id: true, nome: true, email: true } },
      },
    })

    const gestores = await db.user.findMany({
      where: { role: 'GESTOR', ativo: true },
      select: { id: true, nome: true, email: true },
    })

    const enviados: string[] = []
    const erros: string[] = []
    let ignorados = 0

    for (const prazo of prazos) {
      const dias = diasAte(prazo.dataPrazo)

      // A spec pede aviso a 3 dias e no vencimento. Fora disso, silêncio — um
      // alerta que chega todo dia vira ruído e as pessoas param de ler.
      let tipo: string | null = null
      if (dias < 0) tipo = 'PRAZO_VENCIDO'
      else if (dias <= 3) tipo = 'PRAZO_PROXIMO'
      if (!tipo) continue

      const etapa = ETAPA_LABEL[prazo.etapa as Etapa] || prazo.etapa
      // Etapa no tipo para o registro distinguir "diagramação vencida" de
      // "revisão vencida" da mesma apostila — o unique de AlertaEmail é por
      // (usuário, apostila, tipo).
      const tipoRegistro = `${tipo}_${prazo.etapa}`

      // Responsável primeiro; o gestor recebe cópia de tudo.
      const destinatarios = [
        ...(prazo.responsavel?.email ? [prazo.responsavel] : []),
        ...gestores,
      ]

      const vistos = new Set<string>()

      for (const destinatario of destinatarios) {
        if (!destinatario.email || vistos.has(destinatario.id)) continue
        vistos.add(destinatario.id)

        // Já avisado hoje sobre esta etapa? O cron pode rodar mais de uma vez.
        const jaHoje = await db.alertaEmail.findFirst({
          where: {
            usuarioId: destinatario.id,
            apostilaId: prazo.apostila.id,
            tipo: tipoRegistro,
            criadoEm: { gte: inicioDoDia },
          },
          select: { id: true },
        })

        if (jaHoje) {
          ignorados++
          continue
        }

        const dataFormatada = new Date(prazo.dataPrazo).toLocaleDateString('pt-BR')
        const assunto =
          dias < 0
            ? `Atrasado: ${etapa} de "${prazo.apostila.titulo}" venceu há ${Math.abs(dias)} dia(s)`
            : `${etapa} de "${prazo.apostila.titulo}" vence em ${dias} dia(s)`

        const html =
          dias < 0
            ? templateAlertaPrazoVencido(
                destinatario.nome,
                `${prazo.apostila.titulo} — ${etapa}`,
                Math.abs(dias),
                dataFormatada
              )
            : templateAlertaPrazoProximo(
                destinatario.nome,
                `${prazo.apostila.titulo} — ${etapa}`,
                dias,
                dataFormatada
              )

        try {
          const resultado = await enviarEmail({ para: destinatario.email, assunto, html })

          if (!resultado.success) {
            erros.push(`${destinatario.email}: ${resultado.error}`)
            continue
          }

          // Só registra depois do envio dar certo, senão um erro de SMTP
          // silenciaria o alerta pelo resto do dia.
          await db.alertaEmail.upsert({
            where: {
              usuarioId_apostilaId_tipo: {
                usuarioId: destinatario.id,
                apostilaId: prazo.apostila.id,
                tipo: tipoRegistro,
              },
            },
            update: { criadoEm: new Date(), diasRestantes: dias },
            create: {
              usuarioId: destinatario.id,
              apostilaId: prazo.apostila.id,
              tipo: tipoRegistro,
              diasRestantes: dias,
              emailEnviado: destinatario.email,
              enviado: true,
            },
          })

          enviados.push(`${destinatario.email} · ${prazo.apostila.titulo} · ${etapa}`)
        } catch (err) {
          erros.push(`${destinatario.email}: ${err instanceof Error ? err.message : 'erro'}`)
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        prazosVerificados: prazos.length,
        enviados: enviados.length,
        ignorados,
        erros: erros.length,
        detalhes: { enviados, erros },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/cron/alertas-prazo error:', error)
    return NextResponse.json({ error: 'Erro ao processar alertas' }, { status: 500 })
  }
}
