import type { ApostilaStatus, Serie, UserRole } from '@/types'

export const ROLES: Record<UserRole, { label: string; description: string }> = {
  PROFESSOR: {
    label: 'Professor',
    description: 'Envia conteúdo das aulas',
  },
  DIAGRAMADOR: {
    label: 'Diagramador',
    description: 'Realiza diagramação no InDesign',
  },
  ILUSTRADOR: {
    label: 'Ilustrador',
    description: 'Cria e envia ilustrações',
  },
  REVISOR: {
    label: 'Revisor',
    description: 'Revisa conteúdo pós-edição',
  },
  EDITOR: {
    label: 'Editor',
    description: 'Finaliza e aprova fechamento',
  },
  GESTOR: {
    label: 'Gestor',
    description: 'Gerencia todo o fluxo',
  },
  DIRECAO: {
    label: 'Direção',
    description: 'Visualiza acompanhamento',
  },
  PROPRIETARIO: {
    label: 'Proprietário',
    description: 'Visualiza resumo geral',
  },
}

export const APOSTILA_STATUS: Record<ApostilaStatus, { label: string; color: string; bgColor: string }> = {
  RECEBIDO: {
    label: 'Recebido',
    color: 'text-blue-600 dark:text-blue-300',
    bgColor: 'bg-blue-100 dark:bg-blue-900/40',
  },
  EM_REVISAO_INICIAL: {
    label: 'Em Revisão Inicial',
    color: 'text-yellow-600 dark:text-yellow-300',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/40',
  },
  DISTRIBUIDO: {
    label: 'Distribuído',
    color: 'text-purple-600 dark:text-purple-300',
    bgColor: 'bg-purple-100 dark:bg-purple-900/40',
  },
  EM_CONFECCAO: {
    label: 'Em Confecção',
    color: 'text-rf-teal dark:text-teal-200',
    bgColor: 'bg-rf-gray dark:bg-teal-900/40',
  },
  EM_REVISAO_POS_EDICAO: {
    label: 'Em Revisão Pós-Edição',
    color: 'text-orange-600 dark:text-orange-300',
    bgColor: 'bg-orange-100 dark:bg-orange-900/40',
  },
  EM_AJUSTE: {
    label: 'Em Ajuste',
    color: 'text-red-600 dark:text-red-300',
    bgColor: 'bg-red-100 dark:bg-red-900/40',
  },
  FINALIZADO: {
    label: 'Finalizado',
    color: 'text-green-800 dark:text-green-200',
    bgColor: 'bg-rf-green/20 dark:bg-green-900/40',
  },
  ENVIADO_GRAFICA: {
    label: 'Enviado à Gráfica',
    color: 'text-rf-teal dark:text-teal-200',
    bgColor: 'bg-rf-gray dark:bg-teal-900/40',
  },
}

export const SERIES: Record<Serie, { label: string }> = {
  PRIMEIRO_ANO: { label: '1º Ano' },
  SEGUNDO_ANO: { label: '2º Ano' },
  TERCEIRO_ANO: { label: '3º Ano' },
  CURSINHO: { label: 'Cursinho' },
}

export const STATUS_TRANSITIONS: Record<ApostilaStatus, ApostilaStatus[]> = {
  RECEBIDO: ['EM_REVISAO_INICIAL'],
  EM_REVISAO_INICIAL: ['DISTRIBUIDO'],
  DISTRIBUIDO: ['EM_CONFECCAO'],
  EM_CONFECCAO: ['EM_REVISAO_POS_EDICAO'],
  EM_REVISAO_POS_EDICAO: ['EM_AJUSTE', 'FINALIZADO'],
  EM_AJUSTE: ['EM_REVISAO_POS_EDICAO'],
  FINALIZADO: ['ENVIADO_GRAFICA'],
  ENVIADO_GRAFICA: [],
}

// Permissões por rota (quais roles podem acessar)
export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/dashboard': ['PROFESSOR', 'DIAGRAMADOR', 'ILUSTRADOR', 'REVISOR', 'EDITOR', 'GESTOR', 'DIRECAO', 'PROPRIETARIO'],
  '/dashboard/usuarios': ['GESTOR'],
  '/dashboard/templates': ['GESTOR'],
  '/dashboard/professores': ['GESTOR'],
  '/dashboard/diagramadores': ['GESTOR'],
  '/dashboard/revisores': ['GESTOR'],
}

export const JWT_EXPIRATION = '7d'

export const ALLOWED_FILE_TYPES = {
  PROFESSOR: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  DIAGRAMADOR: ['application/pdf', 'application/vnd.adobe.illustrator.document'],
  ILUSTRADOR: ['image/jpeg', 'image/png', 'image/tiff'],
  REVISOR: ['application/pdf'],
}

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
