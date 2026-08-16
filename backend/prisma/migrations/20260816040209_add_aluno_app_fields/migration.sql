/*
  Warnings:

  - Added the required column `senha` to the `Aluno` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN     "apelido" TEXT,
ADD COLUMN     "primeiro_acesso" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "senha" TEXT NOT NULL;
