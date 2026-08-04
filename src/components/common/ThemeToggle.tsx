'use client'

import { useState, useEffect } from 'react'

// A chave 'dark-mode' é a mesma lida pelo script inline do layout, que aplica
// o tema antes da primeira pintura. Mudar aqui exige mudar lá também.
const CHAVE = 'dark-mode'

export function ThemeToggle() {
  const [escuro, setEscuro] = useState(false)
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    setMontado(true)
    try {
      setEscuro(localStorage.getItem(CHAVE) === 'true')
    } catch {
      // Navegador com storage bloqueado: fica no tema claro.
    }
  }, [])

  function alternar() {
    const novo = !escuro
    setEscuro(novo)
    try {
      localStorage.setItem(CHAVE, String(novo))
    } catch {
      // Sem persistência, mas o tema ainda muda nesta sessão.
    }
    document.documentElement.classList.toggle('dark', novo)
  }

  // O servidor não sabe o tema do usuário. Reservar o espaço até montar evita
  // hidratação divergente e o ícone pulando na tela.
  if (!montado) {
    return <div className="w-10 h-10" aria-hidden="true" />
  }

  return (
    <button
      onClick={alternar}
      role="switch"
      aria-checked={escuro}
      aria-label={escuro ? 'Mudar para o tema claro' : 'Mudar para o tema escuro'}
      title={escuro ? 'Tema claro' : 'Tema escuro'}
      className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-800 transition-colors duration-300"
    >
      {escuro ? (
        // Sol: clicar volta para o tema claro
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="4" />
          <path
            strokeLinecap="round"
            d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          />
        </svg>
      ) : (
        // Lua: clicar vai para o tema escuro
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
          />
        </svg>
      )}
    </button>
  )
}
