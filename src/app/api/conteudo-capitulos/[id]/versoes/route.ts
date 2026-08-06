import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'

// Quem já podia ler o capítulo pode ler o histórico: o dono e o gestor.
async function podeVer(capituloId: string, userId: string, userRole: string | null) {
  const capitulo = await db.conteudoCapitulo.findUnique({
    where: { id: capituloId },
    select: { id: true, usuarioId: true },
  })
  if (!capitulo) return { capitulo: null, autorizado: false }
  return {
    capitulo,
    autorizado: capitulo.usuarioId === userId || userRole === 'GESTOR',
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { capitulo, autorizado } = await podeVer(id, userId, userRole)
    if (!capitulo) {
      return NextResponse.json({ error: 'Capítulo não encontrado' }, { status: 404 })
    }
    if (!autorizado) {
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 })
    }

    const versoes = await db.conteudoVersao.findMany({
      where: { capituloId: id },
      select: {
        id: true,
        nomeCapitulo: true,
        criadoEm: true,
        autor: { select: { id: true, nome: true } },
        // O texto inteiro pesa; a lista manda só o tamanho e um trecho, e o
        // conteúdo completo vai na restauração.
        conteudo: true,
      },
      orderBy: { criadoEm: 'desc' },
    })

    const data = versoes.map((v) => ({
      id: v.id,
      nomeCapitulo: v.nomeCapitulo,
      criadoEm: v.criadoEm,
      autor: v.autor,
      caracteres: v.conteudo.length,
      trecho: v.conteudo.slice(0, 180),
    }))

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    console.error('GET /api/conteudo-capitulos/[id]/versoes error:', error)
    return NextResponse.json({ error: 'Erro ao buscar versões' }, { status: 500 })
  }
}

/**
 * Restaura uma versão. A restauração é ela própria uma edição: o texto atual
 * vira mais uma versão antes de ser substituído, então dá para desfazer um
 * "restaurar" errado.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const capitulo = await db.conteudoCapitulo.findUnique({ where: { id } })
    if (!capitulo) {
      return NextResponse.json({ error: 'Capítulo não encontrado' }, { status: 404 })
    }

    // Restaurar escreve no capítulo, então segue a regra do PUT: só o dono.
    if (capitulo.usuarioId !== userId && userRole !== 'GESTOR') {
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    const versaoId = body?.versaoId
    if (!versaoId || typeof versaoId !== 'string') {
      return NextResponse.json({ error: 'Informe a versão a restaurar' }, { status: 400 })
    }

    const versao = await db.conteudoVersao.findUnique({ where: { id: versaoId } })
    if (!versao || versao.capituloId !== id) {
      return NextResponse.json(
        { error: 'Versão não encontrada para este capítulo' },
        { status: 404 }
      )
    }

    const [, atualizado] = await db.$transaction([
      db.conteudoVersao.create({
        data: {
          capituloId: id,
          conteudo: capitulo.conteudo,
          nomeCapitulo: capitulo.capitulo,
          autorId: userId,
        },
      }),
      db.conteudoCapitulo.update({
        where: { id },
        data: {
          conteudo: versao.conteudo,
          capitulo: versao.nomeCapitulo,
          estimadoPaginas: Math.ceil(versao.conteudo.length / 3000),
        },
      }),
    ])

    return NextResponse.json({ success: true, data: atualizado }, { status: 200 })
  } catch (error) {
    console.error('POST /api/conteudo-capitulos/[id]/versoes error:', error)
    return NextResponse.json({ error: 'Erro ao restaurar versão' }, { status: 500 })
  }
}
