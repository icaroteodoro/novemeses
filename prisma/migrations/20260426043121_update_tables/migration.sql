/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `pregnancies` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "pregnancies" ADD COLUMN     "babyGender" TEXT DEFAULT 'SURPRESA',
ADD COLUMN     "babyName" TEXT,
ADD COLUMN     "babyNameBoy" TEXT,
ADD COLUMN     "babyNameGirl" TEXT,
ADD COLUMN     "onboardingDone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentRole" TEXT DEFAULT 'MAE';

-- CreateIndex
CREATE UNIQUE INDEX "pregnancies_userId_key" ON "pregnancies"("userId");
