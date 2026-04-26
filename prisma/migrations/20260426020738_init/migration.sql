-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firebaseUid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pregnancies" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "currentWeek" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pregnancies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "pregnancyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "pregnancyId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "doctor" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "pregnancyId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "answer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "baby_records" (
    "id" TEXT NOT NULL,
    "pregnancyId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,
    "size" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "baby_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "pregnancyId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_firebaseUid_key" ON "users"("firebaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "pregnancies" ADD CONSTRAINT "pregnancies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_pregnancyId_fkey" FOREIGN KEY ("pregnancyId") REFERENCES "pregnancies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_pregnancyId_fkey" FOREIGN KEY ("pregnancyId") REFERENCES "pregnancies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_pregnancyId_fkey" FOREIGN KEY ("pregnancyId") REFERENCES "pregnancies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "baby_records" ADD CONSTRAINT "baby_records_pregnancyId_fkey" FOREIGN KEY ("pregnancyId") REFERENCES "pregnancies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_pregnancyId_fkey" FOREIGN KEY ("pregnancyId") REFERENCES "pregnancies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
