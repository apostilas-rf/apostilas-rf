import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { headers } from 'next/headers'

const createApostilaSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  materia: z.string().min(2, 'Matéria obrigatória'),
  serie: z.enum(['PRIMEIRO_ANO', 'SEGUNDO_ANO', 'TERCEIRO_ANO', 'CURSINHO']),
  templateId: z.string().optional(),
  prazoEstimado: z.string().datetime().optional(),
  observacoes: z.string().optional(),
})

export async function GET() {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extrair parâmetros de query
    const url = new URL(request.url)
    const serie = url.searchParams.get('serie')
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')

    // Construir filtros
    const where: any = {}

    if (serie && serie !== 'TODOS') {
      where.serie = serie
    }

    if (status && status !== 'TODOS') {
      where.status = status
    }

    // Se for professor, mostrar apenas suas apostilas
    if (userRole === 'PROFESSOR') {
      where.professorId = userId
    }

    // Buscar total para paginação
    const total = await db.apostila.count({ where })

    // Buscar apostilas com paginação
    const apostilas = await db.apostila.findMany({
      where,
      include: {
        professor: {
          select: { id: true, nome: true, email: true },
        },
        atribuicoes: {
          select: { usuarioId: true, tarefa: true, concluido: true },
        },
      },
      orderBy: { criadoEm: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    return NextResponse.json(
      {
        success: true,
        data: apostilas,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/apostilas error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar apostilas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    console.log('POST /api/apostilas:', { userId, userRole })

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Apenas GESTOR e PROFESSOR podem criar
    if (!['GESTOR', 'PROFESSOR'].includes(userRole || '')) {
      return NextResponse.json(
        { error: 'Permissão negada' },
        { status: 403 }
      )
    }

    const body = await request.json()
    console.log('Body recebido:', body)

    // Validar dados
    const validation = createApostilaSchema.safeParse(body)
    console.log('Validação:', validation.success, validation.error?.errors)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { titulo, materia, serie, templateId, prazoEstimado, observacoes } = validation.data

    // Se for PROFESSOR, o professor é o criador
    // Se for GESTOR, pode especificar o professor ou usar a si mesmo
    const professorId = userRole === 'PROFESSOR' ? userId : (body.professorId || userId)

    // Criar apostila
    console.log('Criando apostila:', { titulo, materia, serie, professorId })
    const apostila = await db.apostila.create({
      data: {
        titulo,
        materia,
        serie,
        professorId,
        templateId: templateId || undefined,
        status: 'RECEBIDO',
        prazoEstimado: prazoEstimado ? new Date(prazoEstimado) : undefined,
        observacoes,
      },
      include: {
        professor: {
          select: { id: true, nome: true, email: true },
        },
      },
    })

    console.log('Apostila criada:', apostila.id)

    // Registrar no histórico
    console.log('Criando histórico...')
    await db.apostilaHistory.create({
      data: {
        apostilaId: apostila.id,
        usuarioId: userId!,
        statusNovo: 'RECEBIDO',
        acao: 'CRIADA',
        descricao: `Apostila criada por ${userRole}`,
      },
    })
    console.log('Histórico criado')

    return NextResponse.json(
      { success: true, data: apostila },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/apostilas error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar apostila' },
      { status: 500 }
    )
  }
}
