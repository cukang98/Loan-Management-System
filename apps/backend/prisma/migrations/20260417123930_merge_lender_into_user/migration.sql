/*
  Warnings:

  - You are about to drop the `Lender` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LenderRefreshToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LenderRefreshToken" DROP CONSTRAINT "LenderRefreshToken_lenderId_fkey";

-- DropForeignKey
ALTER TABLE "Loan" DROP CONSTRAINT "Loan_lenderId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "actorType" TEXT NOT NULL DEFAULT 'USER',
ADD COLUMN     "availableCapital" DECIMAL(15,2),
ADD COLUMN     "totalLent" DECIMAL(15,2) DEFAULT 0;

-- DropTable
DROP TABLE "Lender";

-- DropTable
DROP TABLE "LenderRefreshToken";

-- CreateIndex
CREATE INDEX "User_actorType_idx" ON "User"("actorType");

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
