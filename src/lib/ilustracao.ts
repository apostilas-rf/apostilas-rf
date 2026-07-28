/**
 * Pastas de ilustração, organizadas por matéria e tema.
 *
 * Os temas são texto livre definido pelo gestor — cada matéria tem os seus,
 * criados conforme as pastas vão existindo no Drive.
 */

export const MATERIAS_ILUSTRACAO = [
  { id: 'biologia', nome: 'Biologia' },
  { id: 'fisica', nome: 'Física' },
  { id: 'quimica', nome: 'Química' },
  { id: 'matematica', nome: 'Matemática' },
  { id: 'filosofia', nome: 'Filosofia' },
  { id: 'geografia', nome: 'Geografia' },
  { id: 'historia', nome: 'História' },
  { id: 'sociologia', nome: 'Sociologia' },
  { id: 'portugues', nome: 'Língua Portuguesa' },
  { id: 'literatura', nome: 'Literatura' },
  { id: 'redacao', nome: 'Redação' },
] as const

export function nomeMateria(id: string): string {
  return MATERIAS_ILUSTRACAO.find((m) => m.id === id)?.nome ?? id
}

export function isMateriaValida(v: string): boolean {
  return MATERIAS_ILUSTRACAO.some((m) => m.id === v)
}

/**
 * Aceita tanto o ID puro da pasta quanto a URL completa que o Drive mostra
 * na barra de endereços, para o gestor não precisar recortar o ID na mão.
 */
export function extrairFolderId(entrada: string): string {
  const valor = entrada.trim()

  const porCaminho = valor.match(/\/folders\/([a-zA-Z0-9_-]+)/)
  if (porCaminho) return porCaminho[1]

  // URLs de "compartilhar" usam ?id=<id>
  const porQuery = valor.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (porQuery) return porQuery[1]

  return valor
}

export function urlDaPasta(folderId: string): string {
  return `https://drive.google.com/drive/folders/${folderId}?usp=sharing`
}
