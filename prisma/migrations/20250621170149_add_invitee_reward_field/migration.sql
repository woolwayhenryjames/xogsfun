/*
  Warnings:

  - You are about to drop the column `reward` on the `Invite` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Invite" DROP COLUMN "reward",
ADD COLUMN     "inviteeReward" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "inviterReward" DOUBLE PRECISION NOT NULL DEFAULT 0;
