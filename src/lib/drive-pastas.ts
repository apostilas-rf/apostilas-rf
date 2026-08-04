// Resolução da pasta do Google Drive por matéria (+ frente, quando houver).
//
// As chaves de GOOGLE_DRIVE_FOLDERS são sem acento (LINGUA_PORTUGUESA), mas a
// matéria é gravada acentuada ("Língua Portuguesa"), então é preciso normalizar.

export function chaveMateria(materia: string): string {
  return materia
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()
    .replace(/\s+/g, '_')
}

export interface PastaDrive {
  folderId: string
  comFrente: boolean
  chave: string
}

// Matérias com frente usam MATERIA_A/B/C; as sem frente (Filosofia, Literatura,
// Redação, Sociologia, Língua Portuguesa) usam só MATERIA.
export function resolverPasta(
  materia: string,
  frente?: string,
  config: string | undefined = process.env.GOOGLE_DRIVE_FOLDERS
): PastaDrive | null {
  if (!config) return null

  let folders: Record<string, string>
  try {
    folders = JSON.parse(config)
  } catch (e) {
    console.error('GOOGLE_DRIVE_FOLDERS não é um JSON válido:', e)
    return null
  }

  const base = chaveMateria(materia)

  if (frente) {
    const chave = `${base}_${frente.toUpperCase()}`
    if (folders[chave]) return { folderId: folders[chave], comFrente: true, chave }
  }

  if (folders[base]) return { folderId: folders[base], comFrente: false, chave: base }

  return null
}

// P1 - 1 ANO - MATEMATICA - FRENTE A
// O "P" é o bimestre; o "ANO" vem da série da apostila.
export function nomeArquivo(
  materia: string,
  anoNum: number,
  anoEscolar: string | undefined,
  pasta: PastaDrive,
  frente?: string
): string {
  const bimestre = /^P[1-4]$/.test(anoEscolar || '') ? anoEscolar : 'P1'
  const nome = chaveMateria(materia)
  return pasta.comFrente
    ? `${bimestre} - ${anoNum} ANO - ${nome} - FRENTE ${frente!.toUpperCase()}.docx`
    : `${bimestre} - ${anoNum} ANO - ${nome}.docx`
}
