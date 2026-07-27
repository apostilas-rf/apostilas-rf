import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'

export async function GET() {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Apenas GESTOR pode ver o dashboard
    if (userRole !== 'GESTOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Buscar apostilas que estão em produção (status não é ENVIADO ou FINALIZADO)
    const apostilas = await db.apostila.findMany({
      where: {
        status: {
          notIn: ['ENVIADO', 'FINALIZADO'],
        },
      },
      include: {
        atribuicoes: {
          include: {
            usuario: {
              select: { id: true, nome: true, email: true, role: true },
            },
          },
        },
      },
      orderBy: { dataFinal: 'asc' },
      take: 2, // Máximo 2 apostilas simultâneas
    })

    // Processar dados para o dashboard
    const processadas = apostilas.map((apostila) => {
      // Calcular dias restantes
      const hoje = new Date()
      const dataFinal = new Date(apostila.dataFinal || '2099-12-31')
      const diasRestantes = Math.ceil(
        (dataFinal.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Contar atribuições por tarefa
      const conteudoProfessores = apostila.atribuicoes.filter(a => a.tarefa === 'CONTEUDO').length
      const diagramadores = apostila.atribuicoes.filter(a => a.tarefa === 'DIAGRAMACAO').length
      const ilustradores = apostila.atribuicoes.filter(a => a.tarefa === 'ILUSTRACAO').length
      const revisores = apostila.atribuicoes.filter(a => a.tarefa === 'REVISAO').length

      // Gerar alertas
      const alertas = []

      if (diasRestantes < 0) {
        alertas.push({
          tipo: 'CRITICO',
          mensagem: `VENCIDO há ${Math.abs(diasRestantes)} dias`,
          timestamp: new Date().toISOString(),
        })
      } else if (diasRestantes <= 3) {
        alertas.push({
          tipo: 'CRITICO',
          mensagem: `Apenas ${diasRestantes} dias até o prazo`,
          timestamp: new Date().toISOString(),
        })
      } else if (diasRestantes <= 7) {
        alertas.push({
          tipo: 'AVISO',
          mensagem: `${diasRestantes} dias até o prazo`,
          timestamp: new Date().toISOString(),
        })
      }

      // Alertas por falta de atribuições
      if (conteudoProfessores === 0) {
        alertas.push({
          tipo: 'CRITICO',
          mensagem: 'Nenhum professor atribuído para conteúdo',
          timestamp: new Date().toISOString(),
        })
      }

      if (diagramadores === 0 && apostila.status !== 'RECEBIDO') {
        alertas.push({
          tipo: 'AVISO',
          mensagem: 'Nenhum diagramador atribuído',
          timestamp: new Date().toISOString(),
        })
      }

      if (revisores === 0 && apostila.status === 'EM_DIAGRAMACAO') {
        alertas.push({
          tipo: 'AVISO',
          mensagem: 'Nenhum revisor atribuído',
          timestamp: new Date().toISOString(),
        })
      }

      return {
        id: apostila.id,
        titulo: apostila.titulo,
        materia: apostila.materia || 'N/A',
        serie: apostila.serie || 'N/A',
        status: apostila.status,
        bimestre: apostila.observacoes?.match(/P\d/)?.[0] || 'N/A',
        tipo: apostila.serie?.includes('Humanas') ? 'HUMANAS' : 'NATUREZAS',
        prazoEntrega: apostila.dataFinal ? apostila.dataFinal.toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        diasRestantes,
        conteudoRecebido: conteudoProfessores,
        conteudoTotal: 1,
        diagramacaoCompleta: 0,
        diagramacaoTotal: diagramadores || 1,
        revisaoCompleta: 0,
        revisaoTotal: revisores || 1,
        alertas: alertas.slice(0, 3),
      }
    })

    return NextResponse.json(
      { success: true, data: processadas },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/apostilas/em-producao error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar apostilas' },
      { status: 500 }
    )
  }
}
