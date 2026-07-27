-- AlterTable
ALTER TABLE "User" ADD COLUMN "googleId" TEXT,
ADD COLUMN "aprovadoEm" TIMESTAMP(3),
ALTER COLUMN "senha" DROP NOT NULL,
ALTER COLUMN "ativo" SET DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserRole_usuarioId_idx" ON "UserRole"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_usuarioId_role_key" ON "UserRole"("usuarioId", "role");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
