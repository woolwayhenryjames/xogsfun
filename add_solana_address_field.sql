-- 为 User 表添加 solanaAddress 字段
ALTER TABLE "User" ADD COLUMN "solanaAddress" TEXT;

-- 添加唯一约束
CREATE UNIQUE INDEX "User_solanaAddress_key" ON "User"("solanaAddress");