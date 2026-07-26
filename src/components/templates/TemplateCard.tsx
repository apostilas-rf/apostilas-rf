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

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-5 bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{template.titulo}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{serieLabel}</p>
          </div>
          <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
            {numApostilas} apostila(s)
          </span>
        </div>

        {/* Descrição */}
        {template.descricao && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.descricao}</p>
        )}

        {/* Estrutura */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/40 rounded">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📚 Estrutura</p>
          <div className="space-y-1">
            {capitulos.length > 0 ? (
              capitulos.map((cap: any, idx: number) => (
                <p key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                  • {cap.nome}
                </p>
              ))
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">Nenhum capítulo definido</p>
            )}
          </div>
        </div>

        {/* Identidade Visual */}
        {template.estrutura?.identidadeVisual && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/40 rounded">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">🎨 Identidade Visual</p>
            <div className="flex gap-2">
              {template.estrutura.identidadeVisual.corPrimaria && (
                <div
                  className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                  style={{
                    backgroundColor: template.estrutura.identidadeVisual.corPrimaria,
                  }}
                  title={`Cor primária: ${template.estrutura.identidadeVisual.corPrimaria}`}
                />
              )}
              {template.estrutura.identidadeVisual.corSecundaria && (
                <div
                  className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                  style={{
                    backgroundColor: template.estrutura.identidadeVisual.corSecundaria,
                  }}
                  title={`Cor secundária: ${template.estrutura.identidadeVisual.corSecundaria}`}
                />
              )}
            </div>
          </div>
        )}

        {/* Ações */}
        {isGestor && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(template)}
              className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded font-medium hover:bg-blue-200 dark:hover:bg-blue-900/60"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(template.id)}
              className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded font-medium hover:bg-red-200 dark:hover:bg-red-900/60"
            >
              Excluir
            </button>
          </div>
        )}

        {/* Data */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Criado em: {new Date(template.criadoEm).toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  )
}
