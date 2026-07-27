'use client'

interface Template {
  id: string
  titulo: string
  serie: string
  descricao?: string
  estrutura: any
  criadoEm: Date
  _count?: {
    apostilas: number
  }
}

interface TemplateCardProps {
  template: Template
  serieLabel: string
  onEdit: (template: Template) => void
  onDelete: (id: string) => void
  isGestor: boolean
}

export function TemplateCard({ template, serieLabel, onEdit, onDelete, isGestor }: TemplateCardProps) {
  const numApostilas = template._count?.apostilas || 0
  const capitulos = template.estrutura?.capitulos || []
  const temApostila = numApostilas > 0

  return (
    <div className={`rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border-l-4 ${
      temApostila
        ? 'border-l-green-500 bg-green-50 dark:bg-green-950/20'
        : 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20'
    }`}>
      <div className="p-6 bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {template.titulo}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{serieLabel}</p>
          </div>
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${
            temApostila
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
              : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
          }`}>
            {numApostilas > 0 ? `✓ ${numApostilas}` : '○ Novo'}
          </span>
        </div>

        {/* Descrição */}
        {template.descricao && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
            {template.descricao}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {capitulos.length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Capítulos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-rf-green dark:text-emerald-400">
              {numApostilas}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Em Uso</p>
          </div>
        </div>

        {/* Estrutura */}
        {capitulos.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">📚 Capítulos</p>
            <div className="space-y-1">
              {capitulos.slice(0, 3).map((cap: any, idx: number) => (
                <p key={idx} className="text-xs text-blue-900 dark:text-blue-200">
                  • {cap.nome}
                </p>
              ))}
              {capitulos.length > 3 && (
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  + {capitulos.length - 3} capítulo(s)
                </p>
              )}
            </div>
          </div>
        )}

        {/* Identidade Visual */}
        {template.estrutura?.identidadeVisual && (
          <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg">
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">🎨 Identidade Visual</p>
            <div className="flex gap-2">
              {template.estrutura.identidadeVisual.corPrimaria && (
                <div
                  className="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
                  style={{
                    backgroundColor: template.estrutura.identidadeVisual.corPrimaria,
                  }}
                  title={`Primária: ${template.estrutura.identidadeVisual.corPrimaria}`}
                />
              )}
              {template.estrutura.identidadeVisual.corSecundaria && (
                <div
                  className="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
                  style={{
                    backgroundColor: template.estrutura.identidadeVisual.corSecundaria,
                  }}
                  title={`Secundária: ${template.estrutura.identidadeVisual.corSecundaria}`}
                />
              )}
            </div>
          </div>
        )}

        {/* Data */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Criado em {new Date(template.criadoEm).toLocaleDateString('pt-BR')}
        </p>

        {/* Ações */}
        {isGestor && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(template)}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              ✎ Editar
            </button>
            <button
              onClick={() => onDelete(template.id)}
              className="px-4 py-2 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 font-medium rounded-lg transition-colors text-sm"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
