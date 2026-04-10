/*
  Warnings:

  - Changed the type of `projectName` on the `Group` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ProjectName" AS ENUM ('MINISHELL', 'MINIRT', 'CUB3D', 'INCEPTION', 'IRC', 'WEBSERV', 'FT_TRANSCENDENCE');

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "deadline" SET DATA TYPE DATE,
DROP COLUMN "projectName",
ADD COLUMN     "projectName" "ProjectName" NOT NULL;

-- CreateIndex
CREATE INDEX "Group_projectName_idx" ON "Group"("projectName");

-- CreateIndex
CREATE INDEX "Group_isBonus_idx" ON "Group"("isBonus");

-- CreateIndex
CREATE INDEX "Group_deadline_idx" ON "Group"("deadline");

-- CreateIndex
CREATE INDEX "Group_projectName_isBonus_deadline_idx" ON "Group"("projectName", "isBonus", "deadline");
