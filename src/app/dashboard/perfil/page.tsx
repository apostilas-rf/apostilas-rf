'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface UserProfile {
  id: string
  nome: string
  email: string
  role: string
  ativo: boolean
}

interface FotoData {
  dataUrl: string
  nomeArquivo: string
  tipo: string
}

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<UserProfile | null>(null)
  const [foto, setFoto] = useState<FotoData | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string>('')
  const [modoEscuro, setModoEscuro] = useState(false)

  useEffect(() => {
    carregarDados()
    const isDark = localStorage.getItem('dark-mode') === 'true'
    setModoEscuro(isDark)
    if (isDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  async function carregarDados() {
    try {
      const [usuarioRes, fotoRes] = await Promise.all([
        fetch('/api/auth/me', { credentials: 'include' }),
        fetch('/api/usuario/foto', { credentials: 'include' }),
      ])

      if (usuarioRes.ok) {
        const userData = await usuarioRes.json()
        setUsuario(userData.data)
      }

      if (fotoRes.ok) {
        const fotoData = await fotoRes.json()
        if (fotoData.foto) {
          setFoto(fotoData.foto)
          setFotoPreview(fotoData.foto.dataUrl)
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar perfil')
    } finally {
      setCarregando(false)
    }
  }

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande (máximo 5MB)')
      return
    }

    setFotoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setFotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    setError('')
  }

  async function handleSalvarFoto() {
    if (!fotoFile) return

    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData()
    formData.append('foto', fotoFile)

    try {
      const response = await fetch('/api/usuario/foto', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar foto')
      }

      setSuccess('Foto atualizada com sucesso!')
      setFoto({ dataUrl: data.foto, nomeArquivo: fotoFile.name, tipo: fotoFile.type })
      setFotoFile(null)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar foto')
    } finally {
      setLoading(false)
    }
  }

  async function handleMudarSenha(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setError('Preencha todos os campos')
      return
    }

    if (novaSenha.length < 6) {
      setError('Nova senha deve ter no mínimo 6 caracteres')
      return
    }

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não conferem')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/usuario/senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ senhaAtual, novaSenha }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao mudar senha')
      }

      setSuccess('Senha alterada com sucesso!')
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao mudar senha')
    } finally {
      setLoading(false)
    }
  }

  function handleModoEscuro(checked: boolean) {
    setModoEscuro(checked)
    localStorage.setItem('dark-mode', String(checked))
    if (checked) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  if (carregando) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Carregando perfil...</div>
      </div>
    )
  }

  const getInitial = () => usuario?.nome?.charAt(0).toUpperCase() || 'U'

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title dark:text-white">Meu Perfil</h1>
        <p className="section-subtitle dark:text-gray-400">Gerenciar informações pessoais, senha e preferências</p>
      </div>

      {/* Mensagens */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm rounded-xl">
          {success}
        </div>
      )}

      {/* Seção de Foto */}
      <div className="card-elevated dark:bg-gray-800/50 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Foto Profissional</h2>
        </div>

        <div className="space-y-6">
          {/* Preview */}
          <div className="flex justify-center">
            {fotoPreview ? (
              <div className="relative w-32 h-32">
                <Image
                  src={fotoPreview}
                  alt="Foto do perfil"
                  fill
                  className="rounded-2xl object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-rf-green to-emerald-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold">
                {getInitial()}
              </div>
            )}
          </div>

          {/* Upload */}
          <div>
            <label className="label-base dark:text-gray-300">Selecionar Foto</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-xl file:border-0
                file:text-sm file:font-semibold
                file:bg-rf-green/10 file:text-rf-green
                hover:file:bg-rf-green/20
              "
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Formatos: JPG, PNG, GIF (máximo 5MB)</p>
          </div>

          {/* Botão Salvar */}
          {fotoFile && (
            <button
              onClick={handleSalvarFoto}
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Foto'}
            </button>
          )}
        </div>
      </div>

      {/* Informações Pessoais */}
      <div className="card-elevated dark:bg-gray-800/50 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Informações Pessoais</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label-base dark:text-gray-300">Nome</label>
            <input
              type="text"
              value={usuario?.nome || ''}
              disabled
              className="input-base dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="label-base dark:text-gray-300">Email</label>
            <input
              type="email"
              value={usuario?.email || ''}
              disabled
              className="input-base dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="label-base dark:text-gray-300">Função</label>
            <input
              type="text"
              value={usuario?.role || ''}
              disabled
              className="input-base dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            />
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">Informações gerenciadas pelo administrador</p>
        </div>
      </div>

      {/* Alterar Senha */}
      <div className="card-elevated dark:bg-gray-800/50 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Alterar Senha</h2>
        </div>

        <form onSubmit={handleMudarSenha} className="space-y-4">
          <div>
            <label className="label-base dark:text-gray-300">Senha Atual</label>
            <input
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              placeholder="Digite sua senha atual"
              className="input-base dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="label-base dark:text-gray-300">Nova Senha</label>
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="input-base dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="label-base dark:text-gray-300">Confirmar Nova Senha</label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Repita a nova senha"
              className="input-base dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:placeholder-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </form>
      </div>

      {/* Preferências */}
      <div className="card-elevated dark:bg-gray-800/50 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Preferências</h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-semibold text-gray-900 dark:text-white">Modo Escuro</label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Ativar tema escuro</p>
          </div>

          <button
            onClick={() => handleModoEscuro(!modoEscuro)}
            className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors ${
              modoEscuro ? 'bg-rf-green' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                modoEscuro ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
