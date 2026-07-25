-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PROFESSOR', 'DIAGRAMADOR', 'ILUSTRADOR', 'REVISOR', 'EDITOR', 'GESTOR', 'DIRECAO', 'PROPRIETARIO');

-- CreateEnum
CREATE TYPE "ApostilaStatus" AS ENUM ('RECEBIDO', 'EM_REVISAO_INICIAL', 'DISTRIBUIDO', 'EM_CONFECCAO', 'EM_REVISAO_POS_EDICAO', 'EM_AJUSTE', 'FINALIZADO', 'ENVIADO_GRAFICA');

-- CreateEnum
CREATE TYPE "Serie" AS ENUM ('PRIMEIRO_ANO', 'SEGUNDO_ANO', 'TERCEIRO_ANO', 'CURSINHO');

-- CreateEnum
CREATE TYPE "ArquivoTipo" AS ENUM ('PROFESSOR', 'PROVA', 'FINAL');

-- CreateEnum
CREATE TYPE "NotificacaoTipo" AS ENUM ('ATRIBUICAO', 'STATUS_MUDOU', 'COMENTARIO', 'REVISAO', 'OUTRAS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PROFESSOR',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "serie" "Serie" NOT NULL,
    "descricao" TEXT,
    "estrutura" JSONB NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Apostila" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "materia" TEXT NOT NULL,
    "serie" "Serie" NOT NULL,
    "status" "ApostilaStatus" NOT NULL DEFAULT 'RECEBIDO',
    "professorId" TEXT NOT NULL,
    "templateId" TEXT,
    "prazoEstimado" TIMESTAMP(3),
    "dataFinal" TIMESTAMP(3),
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Apostila_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAssignment" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "apostilaId" TEXT NOT NULL,
    "tarefa" TEXT NOT NULL,
    "prazoAtribuido" TIMESTAMP(3),
    "prazoEntrega" TIMESTAMP(3),
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApostilaHistory" (
    "id" TEXT NOT NULL,
    "apostilaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "statusAnterior" "ApostilaStatus",
    "statusNovo" "ApostilaStatus" NOT NULL,
    "acao" TEXT NOT NULL,
    "descricao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApostilaHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApostilaArquivo" (
    "id" TEXT NOT NULL,
    "apostilaId" TEXT NOT NULL,
    "tipo" "ArquivoTipo" NOT NULL,
    "nomeOriginal" TEXT NOT NULL,
    "nomeServidor" TEXT NOT NULL,
    "googleDriveId" TEXT,
    "googleDriveUrl" TEXT,
    "usuarioId" TEXT NOT NULL,
    "tamanho" BIGINT,
    "mimeType" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApostilaArquivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacao" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "apostilaId" TEXT,
    "tipo" "NotificacaoTipo" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lido" BOOLEAN NOT NULL DEFAULT false,
    "urlAcao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lidoEm" TIMESTAMP(3),

    CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comentario" (
    "id" TEXT NOT NULL,
    "apostilaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "tipo" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comentario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_ativo_idx" ON "User"("ativo");

-- CreateIndex
CREATE INDEX "Template_serie_idx" ON "Template"("serie");

-- CreateIndex
CREATE UNIQUE INDEX "Template_titulo_serie_key" ON "Template"("titulo", "serie");

-- CreateIndex
CREATE INDEX "Apostila_serie_idx" ON "Apostila"("serie");

-- CreateIndex
CREATE INDEX "Apostila_status_idx" ON "Apostila"("status");

-- CreateIndex
CREATE INDEX "Apostila_professorId_idx" ON "Apostila"("professorId");

-- CreateIndex
CREATE INDEX "Apostila_materia_idx" ON "Apostila"("materia");

-- CreateIndex
CREATE INDEX "UserAssignment_apostilaId_idx" ON "UserAssignment"("apostilaId");

-- CreateIndex
CREATE INDEX "UserAssignment_usuarioId_idx" ON "UserAssignment"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAssignment_usuarioId_apostilaId_tarefa_key" ON "UserAssignment"("usuarioId", "apostilaId", "tarefa");

-- CreateIndex
CREATE INDEX "ApostilaHistory_apostilaId_idx" ON "ApostilaHistory"("apostilaId");

-- CreateIndex
CREATE INDEX "ApostilaHistory_usuarioId_idx" ON "ApostilaHistory"("usuarioId");

-- CreateIndex
CREATE INDEX "ApostilaHistory_criadoEm_idx" ON "ApostilaHistory"("criadoEm");

-- CreateIndex
CREATE INDEX "ApostilaArquivo_apostilaId_idx" ON "ApostilaArquivo"("apostilaId");

-- CreateIndex
CREATE INDEX "ApostilaArquivo_tipo_idx" ON "ApostilaArquivo"("tipo");

-- CreateIndex
CREATE INDEX "ApostilaArquivo_usuarioId_idx" ON "ApostilaArquivo"("usuarioId");

-- CreateIndex
CREATE INDEX "Notificacao_usuarioId_idx" ON "Notificacao"("usuarioId");

-- CreateIndex
CREATE INDEX "Notificacao_apostilaId_idx" ON "Notificacao"("apostilaId");

-- CreateIndex
CREATE INDEX "Notificacao_lido_idx" ON "Notificacao"("lido");

-- CreateIndex
CREATE INDEX "Comentario_apostilaId_idx" ON "Comentario"("apostilaId");

-- CreateIndex
CREATE INDEX "Comentario_usuarioId_idx" ON "Comentario"("usuarioId");

-- AddForeignKey
ALTER TABLE "Apostila" ADD CONSTRAINT "Apostila_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Apostila" ADD CONSTRAINT "Apostila_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAssignment" ADD CONSTRAINT "UserAssignment_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAssignment" ADD CONSTRAINT "UserAssignment_apostilaId_fkey" FOREIGN KEY ("apostilaId") REFERENCES "Apostila"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApostilaHistory" ADD CONSTRAINT "ApostilaHistory_apostilaId_fkey" FOREIGN KEY ("apostilaId") REFERENCES "Apostila"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApostilaHistory" ADD CONSTRAINT "ApostilaHistory_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApostilaArquivo" ADD CONSTRAINT "ApostilaArquivo_apostilaId_fkey" FOREIGN KEY ("apostilaId") REFERENCES "Apostila"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApostilaArquivo" ADD CONSTRAINT "ApostilaArquivo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_apostilaId_fkey" FOREIGN KEY ("apostilaId") REFERENCES "Apostila"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_apostilaId_fkey" FOREIGN KEY ("apostilaId") REFERENCES "Apostila"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
