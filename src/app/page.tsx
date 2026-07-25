import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-rf-green to-rf-teal flex items-center justify-center">
      <div className="text-center">
        <div className="-mb-4">
          <div className="inline-block w-48 h-48 relative">
            <Image
              src="/logo-white.png"
              alt="Logo RF Educação"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Apostilas RF</h1>
        <p className="text-xl text-white text-opacity-90 mb-8">
          Plataforma de Produção de Apostilas
        </p>
        <Link
          href="/auth/login"
          className="inline-block bg-white text-rf-green font-bold py-3 px-8 rounded-lg hover:shadow-lg transition-all"
        >
          Entrar na Plataforma
        </Link>
      </div>
    </main>
  )
}
