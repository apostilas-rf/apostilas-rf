-- Prazos por etapa da apostila (REVISAO_INICIAL, DIAGRAMACAO, REVISAO_FINAL, GRAFICA).
-- A Vercel não roda migration: rode este arquivo no SQL Editor do Supabase
-- ANTES de subir o deploy que usa o model Deadline.

CREATE TYPE "EtapaProducao" AS ENUM ('REVISAO_INICIAL', 'DIAGRAMACAO', 'REVISAO_FINAL', 'GRAFICA');

CREATE TABLE "Deadline" (
    "id" TEXT NOT NULL,
    "apostilaId" TEXT NOT NULL,
    "etapa" "EtapaProducao" NOT NULL,
    "dataPrazo" TIMESTAMP(3) NOT NULL,
    "responsavelId" TEXT,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "concluidoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deadline_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Deadline_apostilaId_etapa_key" ON "Deadline"("apostilaId", "etapa");
CREATE INDEX "Deadline_apostilaId_idx" ON "Deadline"("apostilaId");
CREATE INDEX "Deadline_responsavelId_idx" ON "Deadline"("responsavelId");
CREATE INDEX "Deadline_dataPrazo_idx" ON "Deadline"("dataPrazo");

ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_apostilaId_fkey"
    FOREIGN KEY ("apostilaId") REFERENCES "Apostila"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_responsavelId_fkey"
    FOREIGN KEY ("responsavelId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
