import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apostila = await db.apostila.findFirst({
      where: { id },
      include: {
        conteudosCapitulos: {
          orderBy: { id: 'asc' },
          select: { capitulo: true, conteudo: true },
        },
      },
    })

    if (!apostila) {
      return NextResponse.json({ error: 'Apostila não encontrada' }, { status: 404 })
    }

    // Monta o texto completo
    const linhas = [
      `# ${apostila.titulo}`,
      `Matéria: ${apostila.materia}`,
      `Série: ${apostila.serie}`,
      apostila.anoEscolar ? `Bimestre: ${apostila.anoEscolar}` : '',
      '',
    ].filter(Boolean)

    for (const cap of apostila.conteudosCapitulos) {
      linhas.push(`## ${cap.capitulo}`)
      linhas.push(cap.conteudo || '')
      linhas.push('')
    }

    const texto = linhas.join('\n')

    return new NextResponse(texto, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${apostila.titulo.replace(/\s+/g, '_')}.txt"`,
      },
    })
  } catch (error) {
    console.error('GET /api/apostilas/[id]/export error:', error)
    return NextResponse.json({ error: 'Erro ao exportar apostila' }, { status: 500 })
  }
}
