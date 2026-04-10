-- CreateTable
CREATE TABLE "ProjectRegistration" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "projectName" "ProjectName" NOT NULL,
    "deadline" DATE,
    "isBonus" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectRegistration_projectName_idx" ON "ProjectRegistration"("projectName");

-- CreateIndex
CREATE INDEX "ProjectRegistration_isBonus_idx" ON "ProjectRegistration"("isBonus");

-- CreateIndex
CREATE INDEX "ProjectRegistration_deadline_idx" ON "ProjectRegistration"("deadline");

-- CreateIndex
CREATE INDEX "ProjectRegistration_projectName_isBonus_deadline_idx" ON "ProjectRegistration"("projectName", "isBonus", "deadline");

-- AddForeignKey
ALTER TABLE "ProjectRegistration" ADD CONSTRAINT "ProjectRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
