-- Histórico de versões de capítulo. Cada linha guarda o texto anterior a uma
-- edição, permitindo reverter. Rode no SQL Editor do Supabase ANTES do deploy.

CREATE TABLE "ConteudoVersao" (
    "id" TEXT NOT NULL,
    "capituloId" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "nomeCapitulo" TEXT NOT NULL,
    "autorId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConteudoVersao_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ConteudoVersao_capituloId_criadoEm_idx" ON "ConteudoVersao"("capituloId", "criadoEm");

ALTER TABLE "ConteudoVersao" ADD CONSTRAINT "ConteudoVersao_capituloId_fkey"
    FOREIGN KEY ("capituloId") REFERENCES "ConteudoCapitulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ConteudoVersao" ADD CONSTRAINT "ConteudoVersao_autorId_fkey"
    FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
