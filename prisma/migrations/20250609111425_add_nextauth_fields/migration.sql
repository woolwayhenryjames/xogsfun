-- CreateTable Account for NextAuth
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable Session for NextAuth
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable VerificationToken for NextAuth
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable Sequence for platformId
CREATE TABLE "Sequence" (
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 10000,

    CONSTRAINT "Sequence_pkey" PRIMARY KEY ("name")
);

-- Add missing columns to User table
ALTER TABLE "User" ADD COLUMN "platformId" INTEGER;
ALTER TABLE "User" ADD COLUMN "email" TEXT;
ALTER TABLE "User" ADD COLUMN "emailVerified" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "image" TEXT;
ALTER TABLE "User" ADD COLUMN "twitterUsername" TEXT;

-- Update data types
ALTER TABLE "User" ALTER COLUMN "xogsBalance" TYPE INTEGER USING "xogsBalance"::INTEGER;
ALTER TABLE "User" ALTER COLUMN "aiScore" TYPE INTEGER USING COALESCE("aiScore", 0)::INTEGER;
ALTER TABLE "User" ALTER COLUMN "aiScore" SET DEFAULT 0;
ALTER TABLE "User" ALTER COLUMN "aiScore" SET NOT NULL;

-- Set default values for new columns
UPDATE "User" SET "platformId" = 10000 WHERE "platformId" IS NULL;
UPDATE "User" SET "xogsBalance" = 0 WHERE "xogsBalance" IS NULL;
UPDATE "User" SET "aiScore" = 0 WHERE "aiScore" IS NULL;

-- Add constraints
ALTER TABLE "User" ALTER COLUMN "platformId" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "platformId" SET DEFAULT 10000;

-- Create unique indexes
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
CREATE UNIQUE INDEX "User_platformId_key" ON "User"("platformId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_twitterUsername_key" ON "User"("twitterUsername");

-- Add foreign keys
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Initialize Sequence table
INSERT INTO "Sequence" ("name", "value") VALUES ('platformId', 10000); 