// Só centraliza — cada página de auth define a própria largura. Antes este
// layout impunha max-w-md a todas, o que espremia o cadastro (que pede
// max-w-2xl) a 448px.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {children}
    </div>
  )
}
