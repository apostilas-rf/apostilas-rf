-- CreateTable
CREATE TABLE "PastaIlustracao" (
    "id" TEXT NOT NULL,
    "materia" TEXT NOT NULL,
    "tema" TEXT NOT NULL,
    "driveFolder" TEXT NOT NULL,
    "driveUrl" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PastaIlustracao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PastaIlustracao_materia_idx" ON "PastaIlustracao"("materia");

-- CreateIndex
CREATE UNIQUE INDEX "PastaIlustracao_materia_tema_key" ON "PastaIlustracao"("materia", "tema");
