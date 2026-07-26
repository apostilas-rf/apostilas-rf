-- AlterTable: posicao dos cards de template definida por arrastar
ALTER TABLE "Template" ADD COLUMN "ordem" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Template_ordem_idx" ON "Template"("ordem");
