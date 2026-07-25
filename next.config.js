/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fixa a raiz do projeto para o Next não sair varrendo a Desktop inteira
  outputFileTracingRoot: __dirname,
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
