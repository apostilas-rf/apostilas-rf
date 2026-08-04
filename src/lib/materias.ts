// Fonte única de verdade das matérias.
//
// Amarra três coisas que antes viviam separadas e divergiam: o nome gravado em
// Apostila.materia, a chave em GOOGLE_DRIVE_FOLDERS e quais frentes existem.

export interface Materia {
  /** Nome canônico, como fica gravado em Apostila.materia. */
  nome: string
  /** Chave correspondente em GOOGLE_DRIVE_FOLDERS (sem acento, sem sufixo). */
  chaveDrive: string
  /** Frentes existentes; vazio = matéria sem frente. */
  frentes: string[]
  /** Como já foi digitado antes, de quando o campo era texto livre. */
  apelidos: string[]
}

export const MATERIAS: Materia[] = [
  { nome: 'Biologia', chaveDrive: 'BIOLOGIA', frentes: ['A', 'B', 'C'], apelidos: ['bio'] },
  { nome: 'Física', chaveDrive: 'FISICA', frentes: ['A', 'B'], apelidos: ['fis'] },
  { nome: 'Química', chaveDrive: 'QUIMICA', frentes: ['A', 'B'], apelidos: ['quim'] },
  { nome: 'Matemática', chaveDrive: 'MATEMATICA', frentes: ['A', 'B', 'C'], apelidos: ['mat'] },
  { nome: 'Geografia', chaveDrive: 'GEOGRAFIA', frentes: ['A', 'B'], apelidos: ['geo'] },
  { nome: 'História', chaveDrive: 'HISTORIA', frentes: ['A', 'B'], apelidos: ['hist'] },
  { nome: 'Filosofia', chaveDrive: 'FILOSOFIA', frentes: [], apelidos: ['filo'] },
  { nome: 'Sociologia', chaveDrive: 'SOCIOLOGIA', frentes: [], apelidos: ['socio'] },
  {
    nome: 'Língua Portuguesa',
    chaveDrive: 'LINGUA_PORTUGUESA',
    frentes: [],
    // "Português" é o que estava no placeholder do formulário antigo.
    apelidos: ['Português', 'Portugues', 'Port', 'Lingua Portuguesa'],
  },
  { nome: 'Literatura', chaveDrive: 'LITERATURA', frentes: [], apelidos: ['lit'] },
  { nome: 'Redação', chaveDrive: 'REDACAO', frentes: [], apelidos: ['Redacao'] },
]

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

/** Encontra a matéria ignorando acento, caixa e apelidos antigos. */
export function acharMateria(texto?: string): Materia | null {
  if (!texto) return null
  const alvo = normalizar(texto)

  return (
    MATERIAS.find(
      (m) =>
        normalizar(m.nome) === alvo || m.apelidos.some((a) => normalizar(a) === alvo)
    ) ?? null
  )
}

export function frentesDaMateria(materia?: string): string[] {
  const achada = acharMateria(materia)
  // Matéria desconhecida: mantém as três opções em vez de travar o professor.
  return achada ? achada.frentes : ['A', 'B', 'C']
}

export function materiaTemFrente(materia?: string): boolean {
  return frentesDaMateria(materia).length > 0
}
