import Link from 'next/link'

export default function SignupPendingPage() {
  return (
    <main className="w-full max-w-md">
      <div className="panel w-full p-8 text-center shadow-floating">
        <div className="text-6xl mb-4">⏳</div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Cadastro Pendente
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Sua conta foi criada com sucesso! Agora aguarde a aprovação do gestor.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            📧 Um email será enviado para você assim que sua conta for aprovada.
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <strong>Tempo estimado:</strong> A aprovação geralmente leva até 24 horas.
          </p>
        </div>

        <Link
          href="/auth/login"
          className="inline-block px-6 py-3 bg-rf-green text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Voltar para Login
        </Link>
      </div>
    </main>
  )
}
