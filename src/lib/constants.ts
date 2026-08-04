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
    color: 'text-blue-100 dark:text-blue-100',
    bgColor: 'bg-blue-100 dark:bg-blue-700',
  },
  EM_REVISAO_INICIAL: {
    label: 'Em revisão inicial',
    color: 'text-yellow-100 dark:text-yellow-100',
    bgColor: 'bg-yellow-100 dark:bg-yellow-700',
  },
  EM_DIAGRAMACAO: {
    label: 'Em diagramação',
    color: 'text-purple-100 dark:text-purple-100',
    bgColor: 'bg-purple-100 dark:bg-purple-700',
  },
  EM_REVISAO_FINAL: {
    label: 'Em revisão final',
    color: 'text-orange-100 dark:text-orange-100',
    bgColor: 'bg-orange-100 dark:bg-orange-700',
  },
  EM_AJUSTE: {
    label: 'Em ajuste',
    color: 'text-red-100 dark:text-red-100',
    bgColor: 'bg-red-100 dark:bg-red-700',
  },
  FINALIZADO: {
    label: 'Finalizado',
    color: 'text-green-100 dark:text-green-100',
    bgColor: 'bg-rf-green/20 dark:bg-green-700',
  },
  ENVIADO: {
    label: 'Enviado',
    color: 'text-teal-100 dark:text-teal-100',
    bgColor: 'bg-rf-gray dark:bg-teal-700',
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
  EM_REVISAO_INICIAL: ['EM_DIAGRAMACAO'],
  EM_DIAGRAMACAO: ['EM_REVISAO_FINAL'],
  EM_REVISAO_FINAL: ['EM_AJUSTE', 'FINALIZADO'],
  EM_AJUSTE: ['EM_REVISAO_FINAL'],
  FINALIZADO: ['ENVIADO'],
  ENVIADO: [],
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
