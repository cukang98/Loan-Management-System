/*
  Warnings:

  - You are about to drop the column `installmentAmount` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the column `repaymentFrequency` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the column `tenureMonths` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the column `totalRepayment` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the column `overdueDays` on the `Repayment` table. All the data in the column will be lost.
  - You are about to drop the column `paidAmount` on the `Repayment` table. All the data in the column will be lost.
  - You are about to drop the column `paidAt` on the `Repayment` table. All the data in the column will be lost.
  - You are about to drop the column `remainingBalance` on the `Repayment` table. All the data in the column will be lost.
  - Added the required column `interestAmount` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repaymentType` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenure` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenureType` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Repayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentDate` to the `Repayment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TenureType" AS ENUM ('DAY', 'WEEK', 'MONTH');

-- CreateEnum
CREATE TYPE "RepaymentType" AS ENUM ('INSTALLMENT', 'DAILY', 'MONTHLY', 'ROLLING');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'OTHER');

-- AlterTable
ALTER TABLE "Loan" DROP COLUMN "installmentAmount",
DROP COLUMN "repaymentFrequency",
DROP COLUMN "tenureMonths",
DROP COLUMN "totalRepayment",
ADD COLUMN     "interestAmount" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "repaymentType" "RepaymentType" NOT NULL,
ADD COLUMN     "tenure" INTEGER NOT NULL,
ADD COLUMN     "tenureType" "TenureType" NOT NULL,
ALTER COLUMN "interestRate" SET DATA TYPE DECIMAL(8,4),
ALTER COLUMN "interestModel" SET DEFAULT 'FLAT',
ALTER COLUMN "startDate" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "Repayment" DROP COLUMN "overdueDays",
DROP COLUMN "paidAmount",
DROP COLUMN "paidAt",
DROP COLUMN "remainingBalance",
ADD COLUMN     "amount" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "method" "PaymentMethod" NOT NULL DEFAULT 'CASH',
ADD COLUMN     "paymentDate" DATE NOT NULL;

-- DropEnum
DROP TYPE "RepaymentFrequency";

-- CreateTable
CREATE TABLE "RepaymentSchedule" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "installmentNo" INTEGER NOT NULL,
    "dueDate" DATE NOT NULL,
    "principalDue" DECIMAL(15,2) NOT NULL,
    "interestDue" DECIMAL(15,2) NOT NULL,
    "totalDue" DECIMAL(15,2) NOT NULL,
    "paidAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepaymentSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepaymentAllocation" (
    "id" TEXT NOT NULL,
    "repaymentId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "amountApplied" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepaymentAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RepaymentSchedule_loanId_idx" ON "RepaymentSchedule"("loanId");

-- CreateIndex
CREATE INDEX "RepaymentSchedule_dueDate_idx" ON "RepaymentSchedule"("dueDate");

-- CreateIndex
CREATE INDEX "RepaymentSchedule_status_idx" ON "RepaymentSchedule"("status");

-- CreateIndex
CREATE INDEX "RepaymentAllocation_repaymentId_idx" ON "RepaymentAllocation"("repaymentId");

-- CreateIndex
CREATE INDEX "RepaymentAllocation_scheduleId_idx" ON "RepaymentAllocation"("scheduleId");

-- AddForeignKey
ALTER TABLE "RepaymentSchedule" ADD CONSTRAINT "RepaymentSchedule_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepaymentAllocation" ADD CONSTRAINT "RepaymentAllocation_repaymentId_fkey" FOREIGN KEY ("repaymentId") REFERENCES "Repayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepaymentAllocation" ADD CONSTRAINT "RepaymentAllocation_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "RepaymentSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
