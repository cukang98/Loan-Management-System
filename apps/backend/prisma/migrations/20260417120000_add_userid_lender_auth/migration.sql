-- Drop old email index on User
DROP INDEX IF EXISTS "User_email_idx";

-- AlterTable User: add userId (nullable first), make email nullable
ALTER TABLE "User" ADD COLUMN "userId" TEXT;
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

-- Backfill userId from id for existing rows
UPDATE "User" SET "userId" = "id" WHERE "userId" IS NULL;

-- Make userId NOT NULL and add unique constraint
ALTER TABLE "User" ALTER COLUMN "userId" SET NOT NULL;
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");
CREATE INDEX "User_userId_idx" ON "User"("userId");

-- Drop old unique on email (it was @unique, now optional unique)
-- Keep the unique constraint on email but allow nulls (postgres allows multiple nulls in unique index)

-- AlterTable Lender: add login fields
ALTER TABLE "Lender" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Lender" ADD COLUMN "userId" TEXT;
ALTER TABLE "Lender" ADD COLUMN "password" TEXT;
CREATE UNIQUE INDEX "Lender_userId_key" ON "Lender"("userId");
CREATE INDEX "Lender_userId_idx" ON "Lender"("userId");

-- CreateTable LenderRefreshToken
CREATE TABLE "LenderRefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LenderRefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LenderRefreshToken_token_key" ON "LenderRefreshToken"("token");
CREATE INDEX "LenderRefreshToken_lenderId_idx" ON "LenderRefreshToken"("lenderId");

-- AddForeignKey
ALTER TABLE "LenderRefreshToken" ADD CONSTRAINT "LenderRefreshToken_lenderId_fkey"
    FOREIGN KEY ("lenderId") REFERENCES "Lender"("id") ON DELETE CASCADE ON UPDATE CASCADE;
