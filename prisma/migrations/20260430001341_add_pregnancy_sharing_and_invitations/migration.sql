-- DropIndex
DROP INDEX "pregnancies_userId_key";

-- AlterTable
ALTER TABLE "pregnancies" ADD COLUMN     "partnerId" TEXT;

-- CreateTable
CREATE TABLE "pregnancy_invitations" (
    "id" TEXT NOT NULL,
    "pregnancyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "invitedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pregnancy_invitations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pregnancies" ADD CONSTRAINT "pregnancies_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pregnancy_invitations" ADD CONSTRAINT "pregnancy_invitations_pregnancyId_fkey" FOREIGN KEY ("pregnancyId") REFERENCES "pregnancies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pregnancy_invitations" ADD CONSTRAINT "pregnancy_invitations_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
