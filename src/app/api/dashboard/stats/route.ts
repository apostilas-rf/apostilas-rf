import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { APOSTILA_STATUS, SERIES } from '@/lib/constants'
import type { ApostilaStatus } from '@/types'

export async function GET() {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar todas as apostilas
    const apostilas = await db.apostila.findMany({
      include: {
        historicoStatus: true,
        arquivos: true,
      },
    })

    // Contar por série
    const porSerie: Record<string, { total: number; concluidas: number; atrasadas: number }> = {}
    Object.keys(SERIES).forEach((serie) => {
      porSerie[serie] = { total: 0, concluidas: 0, atrasadas: 0 }
    })

    // Contar por status
    const porStatus: Record<string, number> = {}
    Object.keys(APOSTILA_STATUS).forEach((status) => {
      porStatus[status] = 0
    })

    const agora = new Date()

    apostilas.forEach((apostila) => {
      const serie = apostila.serie
      porSerie[serie].total++

      // Verificar se concluída
      if (apostila.status === 'FINALIZADO' || apostila.status === 'ENVIADO') {
        porSerie[serie].concluidas++
      }

      // Verificar se atrasada
      if (apostila.dataFinal && new Date(apostila.dataFinal) < agora && apostila.status !== 'FINALIZADO' && apostila.status !== 'ENVIADO') {
        porSerie[serie].atrasadas++
      }

      // Contar por status
      porStatus[apostila.status]++
    })

    // Buscar atividades recentes
    const atividades = await db.apostilaHistory.findMany({
      take: 10,
      orderBy: { criadoEm: 'desc' },
      include: {
        usuario: {
          select: { nome: true, email: true },
        },
        apostila: {
          select: { titulo: true, serie: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        totalApostilas: apostilas.length,
        porSerie,
        porStatus,
        atividades,
      },
    })
  } catch (error) {
    console.error('GET /api/dashboard/stats error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}
