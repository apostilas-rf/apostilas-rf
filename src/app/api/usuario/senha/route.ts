import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { senhaAtual, novaSenha } = await request.json()

    if (!senhaAtual || !novaSenha) {
      return NextResponse.json({ error: 'Senhas obrigatórias' }, { status: 400 })
    }

    if (novaSenha.length < 6) {
      return NextResponse.json({ error: 'Nova senha deve ter no mínimo 6 caracteres' }, { status: 400 })
    }

    if (senhaAtual === novaSenha) {
      return NextResponse.json({ error: 'Nova senha deve ser diferente da atual' }, { status: 400 })
    }

    const usuario = await db.user.findUnique({
      where: { id: userId },
    })

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha)
    if (!senhaValida) {
      return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10)
    await db.user.update({
      where: { id: userId },
      data: { senha: senhaHash },
    })

    return NextResponse.json({ success: true, message: 'Senha alterada com sucesso' })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Erro ao mudar senha:', msg)
    return NextResponse.json({ error: 'Erro ao mudar senha', details: msg }, { status: 500 })
  }
}
