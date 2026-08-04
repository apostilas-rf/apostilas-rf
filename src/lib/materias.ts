// Quais frentes cada matéria tem.
//
// Precisa espelhar as chaves de GOOGLE_DRIVE_FOLDERS: matérias com frente têm
// uma pasta por frente (BIOLOGIA_A, BIOLOGIA_B...), as demais têm uma só
// (FILOSOFIA). Lista vazia = matéria sem frentes.

export const FRENTES_POR_MATERIA: Record<string, string[]> = {
  Biologia: ['A', 'B', 'C'],
  Física: ['A', 'B'],
  Química: ['A', 'B'],
  Matemática: ['A', 'B', 'C'],
  Geografia: ['A', 'B'],
  História: ['A', 'B'],
  Filosofia: [],
  Sociologia: [],
  'Língua Portuguesa': [],
  Literatura: [],
  Redação: [],
}

function normalizar(materia: string): string {
  return materia
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

// Tolerante a acento/caixa, porque a matéria vem de texto livre da apostila.
export function frentesDaMateria(materia?: string): string[] {
  if (!materia) return ['A', 'B', 'C']

  const alvo = normalizar(materia)
  const achou = Object.entries(FRENTES_POR_MATERIA).find(
    ([nome]) => normalizar(nome) === alvo
  )

  // Matéria desconhecida: mantém as três opções em vez de travar o professor.
  return achou ? achou[1] : ['A', 'B', 'C']
}

export function materiaTemFrente(materia?: string): boolean {
  return frentesDaMateria(materia).length > 0
}
