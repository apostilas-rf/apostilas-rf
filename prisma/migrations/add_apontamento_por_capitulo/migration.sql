-- Apontamento do revisor preso a um capítulo, e marcação de resolvido.
-- Colunas em tabela JÁ EXISTENTE: se o deploy subir antes disto, toda query
-- de Comentario passa a dar 500. Rode no Supabase ANTES.

ALTER TABLE "Comentario" ADD COLUMN "capituloId" TEXT;
ALTER TABLE "Comentario" ADD COLUMN "resolvido" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Comentario" ADD COLUMN "resolvidoEm" TIMESTAMP(3);

CREATE INDEX "Comentario_capituloId_idx" ON "Comentario"("capituloId");

ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_capituloId_fkey"
    FOREIGN KEY ("capituloId") REFERENCES "ConteudoCapitulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
