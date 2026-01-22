-- 创建测试用户用于连接测试
INSERT INTO "User" (
  id, 
  name, 
  email, 
  image, 
  "createdAt", 
  "updatedAt",
  "aiScore",
  "xogsBalance"
) VALUES (
  'test-user-123',
  'Test User',
  'test@example.com',
  'https://example.com/avatar.jpg',
  NOW(),
  NOW(),
  100,
  1000
) ON CONFLICT (id) DO UPDATE SET
  "updatedAt" = NOW(),
  name = EXCLUDED.name,
  email = EXCLUDED.email;