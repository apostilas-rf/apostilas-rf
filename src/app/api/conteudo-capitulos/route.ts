import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { z } from 'zod'

const createConteudoSchema = z.object({
  apostilaId: z.string().min(1),
  capitulo: z.string().min(3, 'Capítulo deve ter no mínimo 3 caracteres'),
  frente: z.enum(['A', 'B', 'C']),
  grupoConteudo: z.enum(['NATUREZAS_MATEMATICA', 'HUMANAS_LINGUAGENS']),
  tipo: z.enum(['CONTEUDO', 'REVISAO']),
  topicos: z.array(z.string()).max(10, 'Máximo 10 tópicos'),
  enemTopico: z.string().optional().nullable(),
  enemEstrelas: z.number().min(1).max(5).optional().nullable(),
  conteudo: z.string().min(10, 'Conteúdo deve ter no mínimo 10 caracteres'),
})

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    console.log('POST /api/conteudo-capitulos', { userId, userRole })

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Body recebido:', { ...body, conteudo: `${body.conteudo.substring(0, 50)}...` })

    // Validar dados
    const validation = createConteudoSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { apostilaId, capitulo, frente, grupoConteudo, tipo, topicos, enemTopico, enemEstrelas, conteudo } = validation.data

    // Buscar apostila
    const apostila = await db.apostila.findUnique({ where: { id: apostilaId } })
    if (!apostila) {
      return NextResponse.json({ error: 'Apostila não encontrada' }, { status: 404 })
    }

    // Validar permissão (apenas professor criador pode editar)
    if (apostila.professorId !== userId) {
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 })
    }

    // Validar limite de páginas (aprox 3000 caracteres por página)
    const estimadoPaginas = Math.ceil(conteudo.length / 3000)
    if (estimadoPaginas > 10) {
      return NextResponse.json(
        { error: `Conteúdo ultrapassou 10 páginas (estimado: ${estimadoPaginas})` },
        { status: 400 }
      )
    }

    // Criar conteúdo
    console.log('Criando conteúdo do capítulo...')
    const novoConteudo = await db.conteudoCapitulo.create({
      data: {
        apostilaId,
        capitulo,
        frente,
        grupoConteudo,
        tipo,
        topicos,
        enemTopico: enemTopico || null,
        enemEstrelas: enemEstrelas || null,
        conteudo,
        usuarioId: userId,
        estimadoPaginas,
      },
    })

    console.log('Conteúdo criado:', novoConteudo.id)

    // Registrar no histórico
    await db.apostilaHistory.create({
      data: {
        apostilaId,
        usuarioId: userId,
        statusNovo: apostila.status,
        acao: 'CONTEUDO_CRIADO',
        descricao: `Capítulo "${capitulo}" criado com ${topicos.length} tópicos`,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: novoConteudo.id,
          capitulo: novoConteudo.capitulo,
          frente: novoConteudo.frente,
          tipo: novoConteudo.tipo,
          topicos: novoConteudo.topicos,
          criadoEm: novoConteudo.criadoEm,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/conteudo-capitulos error:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar conteúdo' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const apostilaId = url.searchParams.get('apostilaId')

    if (!apostilaId) {
      return NextResponse.json(
        { error: 'apostilaId é obrigatório' },
        { status: 400 }
      )
    }

    const conteudos = await db.conteudoCapitulo.findMany({
      where: { apostilaId },
      include: {
        usuario: {
          select: { id: true, nome: true },
        },
      },
      orderBy: { criadoEm: 'desc' },
    })

    return NextResponse.json(
      { success: true, data: conteudos },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/conteudo-capitulos error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar conteúdos' },
      { status: 500 }
    )
  }
}
