/*
  Warnings:

  - You are about to drop the `Sequence` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "tokenExpiresAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "Sequence";

-- CreateTable
CREATE TABLE "PlatformIdSequence" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "currentValue" INTEGER NOT NULL DEFAULT 10000,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformIdSequence_pkey" PRIMARY KEY ("id")
);
