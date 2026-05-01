-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_pregnancyId_fkey";

-- DropForeignKey
ALTER TABLE "baby_records" DROP CONSTRAINT "baby_records_pregnancyId_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_pregnancyId_fkey";

-- DropForeignKey
ALTER TABLE "pregnancies" DROP CONSTRAINT "pregnancies_userId_fkey";

-- DropForeignKey
ALTER TABLE "pregnancy_invitations" DROP CONSTRAINT "pregnancy_invitations_invitedById_fkey";

-- DropForeignKey
ALTER TABLE "pregnancy_invitations" DROP CONSTRAINT "pregnancy_invitations_pregnancyId_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_pregnancyId_fkey";

-- DropForeignKey
ALTER TABLE "reminders" DROP CONSTRAINT "reminders_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "reminders" DROP CONSTRAINT "reminders_pregnancyId_fkey";

-- AddForeignKey
ALTER TABLE "pregnancies" ADD CONSTRAINT "pregnancies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pregnancy_invitations" ADD CONSTRAINT "pregnancy_invitations_pregnancyId_fkey" FOREIGN KEY ("pregnancyId") REFERENCES "pregnancies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pregnancy_invitations" ADD CONSTRAINT "pregnancy_invitations_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_pregnancyId_fkey" FOREIGN KEY ("pregnancyId") REFERENCES "pregnancies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_pregnancyId_fkey" FOREIGN KEY ("pregnancyId") REFERENCES "pregnancies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_pregnancyId_fkey" FOREIGN KEY ("pregnancyId") REFERENCES "pregnancies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "baby_records" ADD CONSTRAINT "baby_records_pregnancyId_fkey" FOREIGN KEY ("pregnancyId") REFERENCES "pregnancies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_pregnancyId_fkey" FOREIGN KEY ("pregnancyId") REFERENCES "pregnancies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
