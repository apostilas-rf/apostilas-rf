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

const FORM_VAZIO = {
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

  // Metadados recolhidos quando já estão preenchidos: na edição o professor
  // veio mexer no texto, não na ficha do capítulo.
  const [fichaAberta, setFichaAberta] = useState(!conteudoEditando)

  // null = ainda consultando; evita o aviso piscar na tela a cada carregamento.
  const [driveConectado, setDriveConectado] = useState<boolean | null>(null)

  // Falha só do Drive: o capítulo foi salvo, então não é `error`.
  const [avisoDrive, setAvisoDrive] = useState('')

  // Resultado da volta do Google, sinalizado por query string pelo callback.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const erro = params.get('driveErro')
    const ok = params.get('driveOk')
    if (!erro && !ok) return

    if (erro) setError(erro)
    if (ok) {
      setSuccess('Google Drive conectado! Vale para todos os professores.')
      setDriveConectado(true)
    }

    // Limpa a query para o aviso não voltar a cada refresh.
    window.history.replaceState({}, '', window.location.pathname)
  }, [])

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

  const [formData, setFormData] = useState(FORM_VAZIO)

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
      setFichaAberta(false)
    } else {
      // Sair da edição precisa zerar tudo. Faltava o driveFileId em especial:
      // ele continuava apontando para o capítulo anterior, e o "capítulo novo"
      // salvo em seguida sobrescrevia o arquivo daquele capítulo no Drive.
      setFormData(FORM_VAZIO)
      setDriveFileId(null)
      setFichaAberta(true)
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
      const voltarPara = window.location.pathname
      const response = await fetch(
        `/api/auth/google-drive-auth?voltarPara=${encodeURIComponent(voltarPara)}`,
        { method: 'GET', credentials: 'include' }
      )

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

        const driveData = await driveResponse.json().catch(() => null)

        if (driveResponse.ok) {
          newDriveFileId = driveData?.fileId
          setAvisoDrive('')
        } else {
          // O capítulo é salvo de qualquer jeito; o Drive é um extra. Mas a
          // mensagem precisa aparecer, senão o motivo real fica invisível.
          const motivo = driveData?.error || `Drive respondeu ${driveResponse.status}`
          console.warn('Drive:', motivo, driveData?.details || '')
          setAvisoDrive(motivo)
        }
      } catch (driveError) {
        console.error('Erro ao fazer upload no Drive:', driveError)
        setAvisoDrive('Não foi possível falar com o Drive. O capítulo foi salvo mesmo assim.')
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
      {/* Ficha do capítulo: tudo que não é o texto em si, junto e recolhível.
          Antes eram seis blocos de largura inteira empilhados, e a escrita
          — que é o trabalho de verdade — só começava abaixo da dobra. */}
      <section className="card-inset space-y-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="label-base" htmlFor="capitulo">
              Capítulo *
            </label>
            <input
              id="capitulo"
              type="text"
              name="capitulo"
              value={formData.capitulo}
              onChange={handleInputChange}
              placeholder="Ex: Formação Geológica do Brasil"
              className="input-base"
              required
            />
          </div>
          <button
            type="button"
            onClick={() => setFichaAberta((v) => !v)}
            aria-expanded={fichaAberta}
            className="btn-soft mb-0.5 shrink-0 bg-gray-500/10 text-gray-700 hover:bg-gray-500/20 dark:bg-white/5 dark:text-gray-200"
          >
            {fichaAberta ? 'Ocultar detalhes' : 'Detalhes'}
            <svg
              aria-hidden="true"
              className={`h-4 w-4 transition-transform duration-200 ${fichaAberta ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Resumo do que está escondido, para não precisar abrir só para conferir */}
        {!fichaAberta && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {[
              temFrente ? `Frente ${frenteEfetiva}` : null,
              formData.anoEscolar,
              formData.grupoConteudo === 'NATUREZAS_MATEMATICA'
                ? 'Naturezas e Matemática'
                : 'Humanas e Linguagens',
              formData.tipo === 'CONTEUDO' ? 'Conteúdo' : 'Revisão',
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}

        {/* Só os quatro seletores se recolhem. Tópicos e ENEM ficam
            sempre à vista: são coisas que o professor escreve, não
            ficha técnica, e escondê-los fazia parecer que sumiram. */}
        {fichaAberta && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {temFrente && (
              <div>
                <label className="label-base" htmlFor="frente">
                  Frente
                </label>
                <select
                  id="frente"
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
              <label className="label-base" htmlFor="anoEscolar">
                Bimestre
              </label>
              <select
                id="anoEscolar"
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

            <div>
              <label className="label-base" htmlFor="grupoConteudo">
                Área
              </label>
              <select
                id="grupoConteudo"
                name="grupoConteudo"
                value={formData.grupoConteudo}
                onChange={handleInputChange}
                className="input-base"
              >
                <option value="NATUREZAS_MATEMATICA">Naturezas e Matemática</option>
                <option value="HUMANAS_LINGUAGENS">Humanas e Linguagens</option>
              </select>
            </div>

            <div>
              <label className="label-base" htmlFor="tipo">
                Tipo
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                className="input-base"
              >
                <option value="CONTEUDO">Conteúdo</option>
                <option value="REVISAO">Revisão</option>
              </select>
            </div>
          </div>
        )}

        {/* Tópicos */}
        <div>
          <label className="label-base" htmlFor="novoTopico">
            O que vamos estudar nesse capítulo{' '}
            <span className="font-normal text-gray-400">{formData.topicos.length}/10</span>
          </label>
          <div className="flex gap-2">
            <input
              id="novoTopico"
              type="text"
              value={formData.novoTopico}
              onChange={(e) => setFormData((prev) => ({ ...prev, novoTopico: e.target.value }))}
              onKeyDown={(e) => {
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
              className="btn-soft btn-soft-primary shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Adicionar
            </button>
          </div>

          {formData.topicos.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {formData.topicos.map((topico, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gray-500/10 py-1 pl-3 pr-1.5 text-sm text-gray-700 dark:bg-white/5 dark:text-gray-200"
                >
                  {topico}
                  <button
                    type="button"
                    onClick={() => handleRemoveTopico(index)}
                    aria-label={`Remover ${topico}`}
                    className="grid h-5 w-5 place-items-center rounded-full text-gray-500 transition-colors hover:bg-red-500/15 hover:text-red-600"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ENEM */}
        <div>
          <label className="label-base" htmlFor="novoEnemTopico">
            Cai no ENEM?{' '}
            <span className="font-normal text-gray-400">{formData.enemTopicos.length}/10</span>
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="novoEnemTopico"
              type="text"
              value={formData.novoEnemTopico}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, novoEnemTopico: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddEnemTopico()
                }
              }}
              placeholder="Ex: Climatologia"
              className="input-base flex-1"
              disabled={formData.enemTopicos.length >= 10}
            />
            <select
              value={formData.novoEnemEstrelas}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, novoEnemEstrelas: e.target.value }))
              }
              aria-label="Frequência no ENEM"
              className="input-base sm:w-52"
            >
              <option value="1">⭐ Pouco</option>
              <option value="2">⭐⭐ Raramente</option>
              <option value="3">⭐⭐⭐ Às vezes</option>
              <option value="4">⭐⭐⭐⭐ Frequente</option>
              <option value="5">⭐⭐⭐⭐⭐ Muito frequente</option>
            </select>
            <button
              type="button"
              onClick={handleAddEnemTopico}
              disabled={formData.enemTopicos.length >= 10 || !formData.novoEnemTopico.trim()}
              className="btn-soft btn-soft-primary shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Adicionar
            </button>
          </div>

          {formData.enemTopicos.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {formData.enemTopicos.map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 py-1 pl-3 pr-1.5 text-sm text-amber-800 dark:text-amber-200"
                >
                  {item.topico}
                  <span aria-label={`${item.estrelas} de 5`}>{'⭐'.repeat(item.estrelas)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEnemTopico(index)}
                    aria-label={`Remover ${item.topico}`}
                    className="grid h-5 w-5 place-items-center rounded-full text-amber-700 transition-colors hover:bg-red-500/15 hover:text-red-600 dark:text-amber-300"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Conteúdo com Upload de Imagens */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="label-base">Conteúdo Completo *</label>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ~{estimadoPaginas} página(s) | Máximo: 10 páginas
          </span>
        </div>

        {/* O drop de imagem passou a valer no bloco inteiro: a área tracejada
            dedicada gastava cinco linhas para oferecer o que o Ctrl+V já fazia. */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="panel overflow-hidden"
        >
          {/* Bloco simples, não flex: a barra cuida do próprio arranjo, e como
              filha de um flex ela encolheria para o tamanho do conteúdo,
              espremendo os painéis de fórmula que abrem embaixo. */}
          <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--line)' }}>
            <LatexFormulaToolbar
              onInsertFormula={(latex) => insertMarkdown(` $${latex}$ `)}
              onApplyFormatting={applyTextFormatting}
            />
          </div>

          <div className="px-3 pt-3">
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
              placeholder="Escreva o conteúdo aqui… Arraste ou cole imagens (Ctrl+V) para inseri-las."
              maxLength={30000}
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-medium text-rf-green transition-colors hover:bg-rf-green/10"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 5h18v14H3zM3 16l4.5-4.5a2 2 0 013 0L15 16M14 12l1.5-1.5a2 2 0 013 0L21 13M8.5 8.5h.01" />
              </svg>
              Inserir imagem
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files!)}
              className="hidden"
            />
            <span>{uploadingImage ? 'Enviando imagem…' : 'PNG, JPG ou GIF até 5MB'}</span>
          </div>
        </div>

        {estimadoPaginas > 10 && (
          <p className="text-red-600 text-sm mt-2">
            ⚠️ Conteúdo ultrapassou 10 páginas! Reduza o texto.
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="rounded-2xl bg-rf-green/10 px-4 py-3 text-sm text-rf-green">
          ✓ {success}
        </p>
      )}

      {avisoDrive && (
        <div role="alert" className="rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          <strong>O capítulo foi salvo</strong>, mas não foi para o Google Drive:
          <div className="mt-1">{avisoDrive}</div>
        </div>
      )}

      {/* Só aparece enquanto ninguém conectou o Drive. Uma conexão vale para
          todos os professores, então isto some depois do primeiro gestor. */}
      {driveConectado === false && (
        <div className="card-inset">
          <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
            <strong>Google Drive não conectado.</strong> Os capítulos ainda são salvos
            normalmente, mas não vão virar arquivo Word nas pastas das matérias. Quem
            administra as pastas precisa conectar uma única vez — vale para todos.
          </p>
          <button type="button" onClick={handleAutorizarDrive} className="btn-soft btn-soft-primary">
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
        {/* Cancelar só avisa o pai: zerar formulário e driveFileId é o efeito
            que reage a conteudoEditando virar nulo. */}
        {conteudoEditando ? (
          <button type="button" onClick={() => onCancelEdit?.()} className="btn-secondary">
            Cancelar Edição
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setFormData(FORM_VAZIO)
              setDriveFileId(null)
            }}
            className="btn-secondary"
          >
            Limpar
          </button>
        )}
      </div>
    </form>
  )
}
