/*
  Warnings:

  - The values [DISTRIBUIDO,EM_CONFECCAO,EM_REVISAO_POS_EDICAO,ENVIADO_GRAFICA] on the enum `ApostilaStatus` will be removed. If these variants are still used in the database, this will fail.
  - Changed the type of `role` on the `UserRole` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ConteudoStatus" AS ENUM ('NAO_INICIADO', 'EM_EDICAO', 'ENVIADO_REVISAO', 'EM_REVISAO', 'APROVADO', 'REJEITADO');

-- CreateEnum
CREATE TYPE "StatusPrazo" AS ENUM ('NO_PRAZO', 'VENCIMENTO_PROXIMO', 'VENCIDO', 'COMPLETADO');

-- AlterEnum
BEGIN;
CREATE TYPE "ApostilaStatus_new" AS ENUM ('RECEBIDO', 'EM_REVISAO_INICIAL', 'EM_DIAGRAMACAO', 'EM_REVISAO_FINAL', 'EM_AJUSTE', 'FINALIZADO', 'ENVIADO');
ALTER TABLE "Apostila" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Apostila" ALTER COLUMN "status" TYPE "ApostilaStatus_new" USING ("status"::text::"ApostilaStatus_new");
ALTER TABLE "ApostilaHistory" ALTER COLUMN "statusAnterior" TYPE "ApostilaStatus_new" USING ("statusAnterior"::text::"ApostilaStatus_new");
ALTER TABLE "ApostilaHistory" ALTER COLUMN "statusNovo" TYPE "ApostilaStatus_new" USING ("statusNovo"::text::"ApostilaStatus_new");
ALTER TYPE "ApostilaStatus" RENAME TO "ApostilaStatus_old";
ALTER TYPE "ApostilaStatus_new" RENAME TO "ApostilaStatus";
DROP TYPE "ApostilaStatus_old";
ALTER TABLE "Apostila" ALTER COLUMN "status" SET DEFAULT 'RECEBIDO';
COMMIT;

-- AlterTable
ALTER TABLE "UserAssignment" ADD COLUMN     "statusPrazo" "StatusPrazo" NOT NULL DEFAULT 'NO_PRAZO';

-- AlterTable
ALTER TABLE "UserRole" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;

-- CreateTable
CREATE TABLE "DiagramacaoProgresso" (
    "id" TEXT NOT NULL,
    "apostilaId" TEXT NOT NULL,
    "diagramadorId" TEXT NOT NULL,
    "paginaInicio" INTEGER,
    "paginaFim" INTEGER,
    "paginasTotal" INTEGER,
    "percentualProgresso" INTEGER DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiagramacaoProgresso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemaaDiagramacao" (
    "id" TEXT NOT NULL,
    "apostilaId" TEXT NOT NULL,
    "diagramadorId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ABERTO',
    "respostaProf" TEXT,
    "respostaPorId" TEXT,
    "respondidoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProblemaaDiagramacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConteudoCapitulo" (
    "id" TEXT NOT NULL,
    "apostilaId" TEXT NOT NULL,
    "capitulo" TEXT NOT NULL,
    "frente" TEXT NOT NULL,
    "grupoConteudo" TEXT,
    "tipo" TEXT NOT NULL,
    "topicos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "enemTopico" TEXT,
    "enemEstrelas" INTEGER,
    "conteudo" TEXT NOT NULL,
    "imagensUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "estimadoPaginas" INTEGER,
    "paginasUtilizadas" INTEGER,
    "status" "ConteudoStatus" NOT NULL DEFAULT 'NAO_INICIADO',
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConteudoCapitulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertaEmail" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "apostilaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "diasRestantes" INTEGER NOT NULL,
    "enviado" BOOLEAN NOT NULL DEFAULT true,
    "emailEnviado" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertaEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FotoPerfil" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "dataUrl" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FotoPerfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IlustradorPasta" (
    "id" TEXT NOT NULL,
    "bimestre" TEXT NOT NULL,
    "serie" TEXT NOT NULL,
    "materia" TEXT NOT NULL,
    "driveFolder" TEXT NOT NULL,
    "driveUrl" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IlustradorPasta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiagramacaoProgresso_apostilaId_idx" ON "DiagramacaoProgresso"("apostilaId");

-- CreateIndex
CREATE INDEX "DiagramacaoProgresso_diagramadorId_idx" ON "DiagramacaoProgresso"("diagramadorId");

-- CreateIndex
CREATE UNIQUE INDEX "DiagramacaoProgresso_apostilaId_diagramadorId_key" ON "DiagramacaoProgresso"("apostilaId", "diagramadorId");

-- CreateIndex
CREATE INDEX "ProblemaaDiagramacao_apostilaId_idx" ON "ProblemaaDiagramacao"("apostilaId");

-- CreateIndex
CREATE INDEX "ProblemaaDiagramacao_diagramadorId_idx" ON "ProblemaaDiagramacao"("diagramadorId");

-- CreateIndex
CREATE INDEX "ProblemaaDiagramacao_professorId_idx" ON "ProblemaaDiagramacao"("professorId");

-- CreateIndex
CREATE INDEX "ProblemaaDiagramacao_status_idx" ON "ProblemaaDiagramacao"("status");

-- CreateIndex
CREATE INDEX "ConteudoCapitulo_apostilaId_idx" ON "ConteudoCapitulo"("apostilaId");

-- CreateIndex
CREATE INDEX "ConteudoCapitulo_usuarioId_idx" ON "ConteudoCapitulo"("usuarioId");

-- CreateIndex
CREATE INDEX "ConteudoCapitulo_status_idx" ON "ConteudoCapitulo"("status");

-- CreateIndex
CREATE INDEX "AlertaEmail_usuarioId_idx" ON "AlertaEmail"("usuarioId");

-- CreateIndex
CREATE INDEX "AlertaEmail_apostilaId_idx" ON "AlertaEmail"("apostilaId");

-- CreateIndex
CREATE INDEX "AlertaEmail_tipo_idx" ON "AlertaEmail"("tipo");

-- CreateIndex
CREATE INDEX "AlertaEmail_criadoEm_idx" ON "AlertaEmail"("criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "AlertaEmail_usuarioId_apostilaId_tipo_key" ON "AlertaEmail"("usuarioId", "apostilaId", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "FotoPerfil_usuarioId_key" ON "FotoPerfil"("usuarioId");

-- CreateIndex
CREATE INDEX "FotoPerfil_usuarioId_idx" ON "FotoPerfil"("usuarioId");

-- CreateIndex
CREATE INDEX "IlustradorPasta_bimestre_idx" ON "IlustradorPasta"("bimestre");

-- CreateIndex
CREATE INDEX "IlustradorPasta_serie_idx" ON "IlustradorPasta"("serie");

-- CreateIndex
CREATE INDEX "IlustradorPasta_materia_idx" ON "IlustradorPasta"("materia");

-- CreateIndex
CREATE UNIQUE INDEX "IlustradorPasta_bimestre_serie_materia_key" ON "IlustradorPasta"("bimestre", "serie", "materia");

-- CreateIndex
CREATE INDEX "User_googleId_idx" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "UserAssignment_statusPrazo_idx" ON "UserAssignment"("statusPrazo");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_usuarioId_role_key" ON "UserRole"("usuarioId", "role");

-- AddForeignKey
ALTER TABLE "DiagramacaoProgresso" ADD CONSTRAINT "DiagramacaoProgresso_apostilaId_fkey" FOREIGN KEY ("apostilaId") REFERENCES "Apostila"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagramacaoProgresso" ADD CONSTRAINT "DiagramacaoProgresso_diagramadorId_fkey" FOREIGN KEY ("diagramadorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemaaDiagramacao" ADD CONSTRAINT "ProblemaaDiagramacao_apostilaId_fkey" FOREIGN KEY ("apostilaId") REFERENCES "Apostila"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemaaDiagramacao" ADD CONSTRAINT "ProblemaaDiagramacao_diagramadorId_fkey" FOREIGN KEY ("diagramadorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemaaDiagramacao" ADD CONSTRAINT "ProblemaaDiagramacao_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConteudoCapitulo" ADD CONSTRAINT "ConteudoCapitulo_apostilaId_fkey" FOREIGN KEY ("apostilaId") REFERENCES "Apostila"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConteudoCapitulo" ADD CONSTRAINT "ConteudoCapitulo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertaEmail" ADD CONSTRAINT "AlertaEmail_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertaEmail" ADD CONSTRAINT "AlertaEmail_apostilaId_fkey" FOREIGN KEY ("apostilaId") REFERENCES "Apostila"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoPerfil" ADD CONSTRAINT "FotoPerfil_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
