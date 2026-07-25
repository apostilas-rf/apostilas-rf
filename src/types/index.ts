// User types
export type UserRole = 'PROFESSOR' | 'DIAGRAMADOR' | 'ILUSTRADOR' | 'REVISOR' | 'EDITOR' | 'GESTOR' | 'DIRECAO' | 'PROPRIETARIO'

export interface User {
  id: string
  email: string
  nome: string
  role: UserRole
  ativo: boolean
  criadoEm: Date
  atualizadoEm: Date
}

export type UserSession = Omit<User, 'senha'>

// Apostila types
export type ApostilaStatus =
  | 'RECEBIDO'
  | 'EM_REVISAO_INICIAL'
  | 'DISTRIBUIDO'
  | 'EM_CONFECCAO'
  | 'EM_REVISAO_POS_EDICAO'
  | 'EM_AJUSTE'
  | 'FINALIZADO'
  | 'ENVIADO_GRAFICA'

export type Serie = 'PRIMEIRO_ANO' | 'SEGUNDO_ANO' | 'TERCEIRO_ANO' | 'CURSINHO'

export interface Apostila {
  id: string
  titulo: string
  materia: string
  serie: Serie
  status: ApostilaStatus
  professorId: string
  templateId?: string
  prazoEstimado?: Date
  dataFinal?: Date
  observacoes?: string
  criadoEm: Date
  atualizadoEm: Date
}

// Arquivo types
export type ArquivoTipo = 'PROFESSOR' | 'PROVA' | 'FINAL'

export interface ApostilaArquivo {
  id: string
  apostilaId: string
  tipo: ArquivoTipo
  nomeOriginal: string
  nomeServidor: string
  googleDriveId?: string
  googleDriveUrl?: string
  usuarioId: string
  tamanho?: number
  mimeType?: string
  criadoEm: Date
}

// Notificacao types
export type NotificacaoTipo = 'ATRIBUICAO' | 'STATUS_MUDOU' | 'COMENTARIO' | 'REVISAO' | 'OUTRAS'

export interface Notificacao {
  id: string
  usuarioId: string
  apostilaId?: string
  tipo: NotificacaoTipo
  titulo: string
  mensagem: string
  lido: boolean
  urlAcao?: string
  criadoEm: Date
  lidoEm?: Date
}

// Assignment types
export interface UserAssignment {
  id: string
  usuarioId: string
  apostilaId: string
  tarefa: string
  prazoAtribuido?: Date
  prazoEntrega?: Date
  concluido: boolean
  criadoEm: Date
  atualizadoEm: Date
}

// History types
export interface ApostilaHistory {
  id: string
  apostilaId: string
  usuarioId: string
  statusAnterior?: ApostilaStatus
  statusNovo: ApostilaStatus
  acao: string
  descricao?: string
  criadoEm: Date
}

// Comentario types
export interface Comentario {
  id: string
  apostilaId: string
  usuarioId: string
  conteudo: string
  tipo?: string
  criadoEm: Date
  atualizadoEm: Date
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Auth types
export interface LoginRequest {
  email: string
  senha: string
}

export interface LoginResponse {
  token: string
  usuario: UserSession
}

export interface JWTPayload {
  sub: string
  email: string
  role: UserRole
  iat: number
  exp: number
}
