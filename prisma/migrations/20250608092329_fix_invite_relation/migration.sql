-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "twitterId" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "profileImageUrl" TEXT,
    "description" TEXT,
    "url" TEXT,
    "followersCount" INTEGER,
    "friendsCount" INTEGER,
    "statusesCount" INTEGER,
    "verified" BOOLEAN DEFAULT false,
    "twitterCreatedAt" TIMESTAMP(3),
    "location" TEXT,
    "lang" TEXT,
    "xogsBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aiScore" DOUBLE PRECISION,
    "inviterId" TEXT,
    "inviteCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,
    "reward" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_twitterId_key" ON "User"("twitterId");

-- CreateIndex
CREATE UNIQUE INDEX "User_inviteCode_key" ON "User"("inviteCode");

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
