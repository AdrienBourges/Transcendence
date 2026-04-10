-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "isBonus" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "projectName" TEXT NOT NULL DEFAULT 'default';
