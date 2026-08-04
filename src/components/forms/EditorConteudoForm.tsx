'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LatexFormulaToolbar } from './LatexFormulaToolbar'
import { RichTextEditor } from './RichTextEditor'
import { frentesDaMateria } from '@/lib/materias'

interface EnemTopico {
  topico: string
  estrelas: number
}

// Capítulos antigos guardam um tópico só em enemTopico/enemEstrelas.
// Converte para a lista usada pelo editor, sem perder o que já existia.
function normalizarEnemTopicos(conteudo: any): EnemTopico[] {
  if (Array.isArray(conteudo?.enemTopicos)) {
    return conteudo.enemTopicos.filter(
      (t: any) => t && typeof t.topico === 'string' && t.topico.trim()
    )
  }
  if (conteudo?.enemTopico) {
    return [{ topico: conteudo.enemTopico, estrelas: conteudo.enemEstrelas || 3 }]
  }
  return []
}

interface EditorConteudoFormProps {
  apostilaId: string
  materia?: string
  serie?: string
  onSuccess?: () => void
  conteudoEditando?: any
  onCancelEdit?: () => void
}

export function EditorConteudoForm({ apostilaId, materia, serie, onSuccess, conteudoEditando, onCancelEdit }: EditorConteudoFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [driveFileId, setDriveFileId] = useState<string | null>(null)

  // null = ainda consultando; evita o aviso piscar na tela a cada carregamento.
  const [driveConectado, setDriveConectado] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelado = false
    fetch('/api/drive-status', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelado && d) setDriveConectado(Boolean(d.conectado))
      })
      .catch(() => {
        // Falha ao consultar não deve atrapalhar quem só quer escrever.
      })
    return () => {
      cancelado = true
    }
  }, [])

  const [formData, setFormData] = useState({
    capitulo: '',
    frente: 'A' as 'A' | 'B' | 'C',
    anoEscolar: 'P1',
    grupoConteudo: 'NATUREZAS_MATEMATICA' as 'NATUREZAS_MATEMATICA' | 'HUMANAS_LINGUAGENS',
    tipo: 'CONTEUDO' as 'CONTEUDO' | 'REVISAO',
    topicos: [] as string[],
    novoTopico: '',
    enemTopicos: [] as EnemTopico[],
    novoEnemTopico: '',
    novoEnemEstrelas: '3',
    conteudo: '',
  })

  // Filosofia, Literatura, Língua Portuguesa, Sociologia e Redação não têm
  // frente; Física/Química/Geografia/História têm só A e B.
  const frentesDisponiveis = frentesDaMateria(materia)
  const temFrente = frentesDisponiveis.length > 0

  // Sem frente vai nulo; e evita gravar uma frente que a matéria não tem
  // (ex.: "C" herdada do padrão numa matéria que só tem A e B).
  const frenteEfetiva = !temFrente
    ? null
    : frentesDisponiveis.includes(formData.frente)
      ? formData.frente
      : frentesDisponiveis[0]

  useEffect(() => {
    if (conteudoEditando) {
      setFormData({
        capitulo: conteudoEditando.capitulo,
        frente: conteudoEditando.frente,
        anoEscolar: conteudoEditando.anoEscolar || 'P1',
        grupoConteudo: conteudoEditando.grupoConteudo,
        tipo: conteudoEditando.tipo,
        topicos: conteudoEditando.topicos,
        novoTopico: '',
        enemTopicos: normalizarEnemTopicos(conteudoEditando),
        novoEnemTopico: '',
        novoEnemEstrelas: '3',
        conteudo: conteudoEditando.conteudo,
      })
      setDriveFileId(conteudoEditando.driveFileId || null)
    }
  }, [conteudoEditando])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddTopico = () => {
    if (formData.novoTopico.trim() && formData.topicos.length < 10) {
      setFormData((prev) => ({
        ...prev,
        topicos: [...prev.topicos, prev.novoTopico.trim()],
        novoTopico: '',
      }))
    }
  }

  const handleRemoveTopico = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      topicos: prev.topicos.filter((_, i) => i !== index),
    }))
  }

  const handleAddEnemTopico = () => {
    if (formData.novoEnemTopico.trim() && formData.enemTopicos.length < 10) {
      setFormData((prev) => ({
        ...prev,
        enemTopicos: [
          ...prev.enemTopicos,
          { topico: prev.novoEnemTopico.trim(), estrelas: Number(prev.novoEnemEstrelas) },
        ],
        novoEnemTopico: '',
        novoEnemEstrelas: '3',
      }))
    }
  }

  const handleAutorizarDrive = async () => {
    try {
      const response = await fetch('/api/auth/google-drive-auth', {
        method: 'GET',
        credentials: 'include',
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        // A mensagem do servidor diz exatamente o que falta configurar.
        setError(data?.error || 'Erro ao iniciar autorização do Google Drive')
        return
      }
      // Redireciona para o Google
      window.location.href = data.authUrl
    } catch (err) {
      setError('Erro ao conectar ao Google. Tente novamente.')
      console.error('Drive auth error:', err)
    }
  }

  const handleRemoveEnemTopico = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      enemTopicos: prev.enemTopicos.filter((_, i) => i !== index),
    }))
  }

  const insertMarkdown = (markdown: string, before?: string, after?: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = formData.conteudo.substring(start, end)

      // Se há texto selecionado e antes/after foram fornecidos, aplica formatação ao redor
      if (selectedText && before && after) {
        const newContent = formData.conteudo.substring(0, start) + before + selectedText + after + formData.conteudo.substring(end)
        setFormData((prev) => ({ ...prev, conteudo: newContent }))
        setTimeout(() => {
          textarea.focus()
          textarea.selectionStart = start
          textarea.selectionEnd = start + before.length + selectedText.length + after.length
        }, 0)
      } else {
        // Se não há seleção, insere como antes
        const newContent = formData.conteudo.substring(0, start) + markdown + formData.conteudo.substring(end)
        setFormData((prev) => ({ ...prev, conteudo: newContent }))
        setTimeout(() => {
          textarea.focus()
          textarea.selectionStart = start + markdown.length
          textarea.selectionEnd = start + markdown.length
        }, 0)
      }
    }
  }

  const insertImageMarkdown = (imageUrl: string, fileName: string) => {
    const markdown = `![${fileName}](${imageUrl})\n`
    insertMarkdown(markdown)
  }

  const applyTextFormatting = (before: string, after: string, placeholder: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = formData.conteudo.substring(start, end)

      if (selectedText) {
        // Se há texto selecionado, aplica formatação ao redor
        const newContent = formData.conteudo.substring(0, start) + before + selectedText + after + formData.conteudo.substring(end)
        setFormData((prev) => ({ ...prev, conteudo: newContent }))
        setTimeout(() => {
          textarea.focus()
          textarea.selectionStart = start + before.length
          textarea.selectionEnd = start + before.length + selectedText.length
        }, 0)
      } else {
        // Se não há seleção, insere placeholder com formatação
        insertMarkdown(`${before}${placeholder}${after}`)
      }
    }
  }

  const insertFormula = (isBlock: boolean = false) => {
    const placeholder = 'escreva a fórmula aqui'
    const markdown = isBlock ? `\n$$${placeholder}$$\n` : ` $${placeholder}$ `
    insertMarkdown(markdown)
  }

  const handleImageUpload = async (files: FileList) => {
    if (!files.length) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (!file.type.startsWith('image/')) {
        setError('Apenas arquivos de imagem são permitidos')
        continue
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Imagem deve ter menos de 5MB')
        continue
      }

      setUploadingImage(true)
      try {
        const formDataImg = new FormData()
        formDataImg.append('file', file)
        formDataImg.append('apostilaId', apostilaId)

        const response = await fetch('/api/upload-imagem', {
          method: 'POST',
          credentials: 'include',
          body: formDataImg,
        })

        if (!response.ok) {
          const data = await response.json()
          setError(data.error || 'Erro ao fazer upload da imagem')
          continue
        }

        const data = await response.json()
        insertImageMarkdown(data.imageUrl, file.name)
        setError('')
      } catch (err) {
        setError('Erro ao fazer upload da imagem')
        console.error(err)
      } finally {
        setUploadingImage(false)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files) {
      handleImageUpload(e.dataTransfer.files)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault()
        const file = items[i].getAsFile()
        if (file) {
          const dt = new DataTransfer()
          dt.items.add(file)
          handleImageUpload(dt.files)
        }
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!formData.capitulo.trim()) {
        setError('Capítulo é obrigatório')
        setLoading(false)
        return
      }

      if (!formData.conteudo.trim()) {
        setError('Conteúdo é obrigatório')
        setLoading(false)
        return
      }

      // Upload para Drive ANTES de salvar no banco (para ter o fileId)
      let newDriveFileId = driveFileId
      try {
        const driveResponse = await fetch('/api/upload-conteudo-drive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            conteudo: formData.conteudo,
            capitulo: formData.capitulo,
            apostilaId,
            driveFileId: driveFileId, // Se existir, vai atualizar
            materia: materia,
            serie: serie,
            frente: frenteEfetiva,
            anoEscolar: formData.anoEscolar,
          }),
        })

        if (driveResponse.ok) {
          const driveData = await driveResponse.json()
          newDriveFileId = driveData.fileId
          console.log('Drive upload/update:', driveData.message)
        } else {
          console.warn('Aviso: Não foi possível salvar no Drive')
        }
      } catch (driveError) {
        console.error('Erro ao fazer upload no Drive:', driveError)
      }

      const url = conteudoEditando
        ? `/api/conteudo-capitulos/${conteudoEditando.id}`
        : '/api/conteudo-capitulos'

      const response = await fetch(url, {
        method: conteudoEditando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          apostilaId,
          capitulo: formData.capitulo,
          frente: frenteEfetiva,
          anoEscolar: formData.anoEscolar,
          grupoConteudo: formData.grupoConteudo,
          tipo: formData.tipo,
          topicos: formData.topicos,
          enemTopicos: formData.enemTopicos,
          conteudo: formData.conteudo,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Erro ao salvar capítulo')
        return
      }

      setSuccess(conteudoEditando ? 'Capítulo atualizado com sucesso!' : 'Capítulo salvo com sucesso!')

      // Atualizar driveFileId no estado local para próximas edições
      if (newDriveFileId) {
        setDriveFileId(newDriveFileId)
      }

      setFormData({
        capitulo: '',
        frente: 'A',
        anoEscolar: 'P1',
        grupoConteudo: 'NATUREZAS_MATEMATICA',
        tipo: 'CONTEUDO',
        topicos: [],
        novoTopico: '',
        enemTopicos: [],
        novoEnemTopico: '',
        novoEnemEstrelas: '3',
        conteudo: '',
      })

      setTimeout(() => {
        onSuccess?.()
      }, 1000)
    } catch (err) {
      setError('Erro na conexão. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const estimadoPaginas = Math.ceil(formData.conteudo.length / 3000)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Linha 1: Capítulo */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="label-base">Capítulo *</label>
          <input
            type="text"
            name="capitulo"
            value={formData.capitulo}
            onChange={handleInputChange}
            placeholder="Ex: Formação Geológica do Brasil"
            className="input-base"
            required
          />
        </div>
      </div>

      {/* Linha 2: Frente (quando a matéria tem) e Bimestre */}
      <div className={`grid grid-cols-1 gap-4 ${temFrente ? 'md:grid-cols-2' : ''}`}>
        {temFrente && (
          <div>
            <label className="label-base">Frente</label>
            <select
              name="frente"
              value={formData.frente}
              onChange={handleInputChange}
              className="input-base"
            >
              {frentesDisponiveis.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="label-base">Bimestre</label>
          <select
            name="anoEscolar"
            value={formData.anoEscolar}
            onChange={handleInputChange}
            className="input-base"
          >
            <option value="P1">P1</option>
            <option value="P2">P2</option>
            <option value="P3">P3</option>
            <option value="P4">P4</option>
          </select>
        </div>
      </div>

      {/* Grupo de Conteúdo */}
      <div>
        <label className="label-base">Área de Conhecimento</label>
        <select
          name="grupoConteudo"
          value={formData.grupoConteudo}
          onChange={handleInputChange}
          className="input-base"
        >
          <option value="NATUREZAS_MATEMATICA">Naturezas e Matemática</option>
          <option value="HUMANAS_LINGUAGENS">Humanas e Linguagens</option>
        </select>
      </div>

      {/* Tipo de Conteúdo */}
      <div>
        <label className="label-base">Tipo</label>
        <select
          name="tipo"
          value={formData.tipo}
          onChange={handleInputChange}
          className="input-base"
        >
          <option value="CONTEUDO">Conteúdo</option>
          <option value="REVISAO">Revisão</option>
        </select>
      </div>

      {/* Tópicos */}
      <div>
        <label className="label-base">O que vamos estudar nesse capítulo {formData.topicos.length}/10</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={formData.novoTopico}
            onChange={(e) => setFormData((prev) => ({ ...prev, novoTopico: e.target.value }))}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTopico()
              }
            }}
            placeholder="Digite um tópico e pressione Enter"
            className="input-base flex-1"
            disabled={formData.topicos.length >= 10}
          />
          <button
            type="button"
            onClick={handleAddTopico}
            disabled={formData.topicos.length >= 10 || !formData.novoTopico.trim()}
            className="btn-primary"
          >
            Adicionar
          </button>
        </div>

        {formData.topicos.length > 0 && (
          <div className="space-y-2">
            {formData.topicos.map((topico, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-100 p-3 rounded"
              >
                <span className="text-gray-700 dark:text-gray-300">• {topico}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTopico(index)}
                  className="text-red-600 hover:text-red-800 font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ENEM */}
      <div>
        <label className="label-base">Cai no ENEM? {formData.enemTopicos.length}/10</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
          <input
            type="text"
            value={formData.novoEnemTopico}
            onChange={(e) => setFormData((prev) => ({ ...prev, novoEnemTopico: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddEnemTopico()
              }
            }}
            placeholder="Ex: Climatologia"
            className="input-base"
            disabled={formData.enemTopicos.length >= 10}
          />
          <select
            value={formData.novoEnemEstrelas}
            onChange={(e) => setFormData((prev) => ({ ...prev, novoEnemEstrelas: e.target.value }))}
            className="input-base"
          >
            <option value="1">⭐ Pouco</option>
            <option value="2">⭐⭐ Raramente</option>
            <option value="3">⭐⭐⭐ Às vezes</option>
            <option value="4">⭐⭐⭐⭐ Frequente</option>
            <option value="5">⭐⭐⭐⭐⭐ Muito Frequente</option>
          </select>
          <button
            type="button"
            onClick={handleAddEnemTopico}
            disabled={formData.enemTopicos.length >= 10 || !formData.novoEnemTopico.trim()}
            className="btn-primary"
          >
            Adicionar
          </button>
        </div>

        {formData.enemTopicos.length > 0 && (
          <div className="space-y-2">
            {formData.enemTopicos.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 p-3 rounded border border-amber-200 dark:border-amber-800"
              >
                <span className="text-gray-700 dark:text-gray-300">
                  • {item.topico} {'⭐'.repeat(item.estrelas)}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveEnemTopico(index)}
                  className="text-red-600 hover:text-red-800 font-bold"
                  aria-label={`Remover ${item.topico}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conteúdo com Upload de Imagens */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="label-base">Conteúdo Completo *</label>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ~{estimadoPaginas} página(s) | Máximo: 10 páginas
          </span>
        </div>

        {/* Container com Toolbar Sticky e Textarea */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {/* Área de Upload */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-b border-gray-200 dark:border-gray-700 border-dashed p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition"
          >
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Arraste imagens aqui, cole (Ctrl+V) ou
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-rf-green hover:underline font-medium text-sm"
              >
                clique para selecionar
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files!)}
                className="hidden"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {uploadingImage ? 'Enviando imagem...' : 'PNG, JPG, GIF até 5MB'}
              </p>
            </div>
          </div>

          {/* Toolbar de Formatação */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3">
            <LatexFormulaToolbar
              onInsertFormula={(latex) => {
                const markdown = ` $${latex}$ `
                insertMarkdown(markdown)
              }}
              onApplyFormatting={applyTextFormatting}
            />
          </div>

          {/* Editor Rico com Renderização em Tempo Real */}
          <div className="p-3">
            <RichTextEditor
              ref={textareaRef}
              value={formData.conteudo}
              onChange={(value) => setFormData((prev) => ({ ...prev, conteudo: value }))}
              onPaste={(e: React.ClipboardEvent<HTMLTextAreaElement>) => {
                const files = e.clipboardData?.files
                if (files && files.length > 0) {
                  e.preventDefault()
                  handleImageUpload(files)
                }
              }}
              placeholder="Escreva o conteúdo aqui... Cole imagens com Ctrl+V para inseri-las automaticamente"
              maxLength={30000}
            />
          </div>
        </div>

        {estimadoPaginas > 10 && (
          <p className="text-red-600 text-sm mt-2">
            ⚠️ Conteúdo ultrapassou 10 páginas! Reduza o texto.
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✓ {success}
        </div>
      )}

      {/* Só aparece enquanto ninguém conectou o Drive. Uma conexão vale para
          todos os professores, então isto some depois do primeiro gestor. */}
      {driveConectado === false && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            <strong>📁 Google Drive não conectado.</strong> Os capítulos ainda são salvos
            normalmente, mas não vão virar arquivo Word nas pastas das matérias. Quem
            administra as pastas precisa conectar uma única vez — vale para todos.
          </p>
          <button
            type="button"
            onClick={handleAutorizarDrive}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm"
          >
            Conectar Google Drive
          </button>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading || estimadoPaginas > 10}
          className="btn-primary flex-1"
        >
          {loading ? 'Salvando...' : conteudoEditando ? 'Atualizar Capítulo' : 'Salvar Capítulo'}
        </button>
        {conteudoEditando ? (
          <button
            type="button"
            onClick={() => {
              onCancelEdit?.()
              setFormData({
                capitulo: '',
                frente: 'A',
                anoEscolar: 'P1',
                grupoConteudo: 'NATUREZAS_MATEMATICA',
                tipo: 'CONTEUDO',
                topicos: [],
                novoTopico: '',
                enemTopicos: [],
                novoEnemTopico: '',
                novoEnemEstrelas: '3',
                conteudo: '',
              })
            }}
            className="btn-secondary"
          >
            Cancelar Edição
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setFormData({
              capitulo: '',
              frente: 'A',
              anoEscolar: 'P1',
              grupoConteudo: 'NATUREZAS_MATEMATICA',
              tipo: 'CONTEUDO',
              topicos: [],
              novoTopico: '',
              enemTopicos: [],
              novoEnemTopico: '',
              novoEnemEstrelas: '3',
              conteudo: '',
            })}
            className="btn-secondary"
          >
            Limpar
          </button>
        )}
      </div>
    </form>
  )
}
