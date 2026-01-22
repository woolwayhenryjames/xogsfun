# 迁移到 Supabase 完整指南

## 📋 为什么选择 Supabase？

### 优势对比

| 特性 | Neon (当前) | Supabase |
|------|-------------|----------|
| 月费用 | $186 → $20-30 | **$0** |
| 数据库类型 | PostgreSQL | PostgreSQL ✅ |
| 免费存储 | 0.5 GB | 500 MB |
| 免费计算 | 300 小时/月 | 无限制 ✅ |
| API 请求 | 无限制 | 无限制 ✅ |
| 额外功能 | 无 | Auth, Storage, Realtime ✅ |
| Prisma 支持 | 完美 | 完美 ✅ |

### 限制

- ⚠️ 数据库在 1 周不活动后会暂停（可通过定时任务保持活跃）
- ⚠️ 免费版有连接数限制（60 并发连接，对大多数应用足够）

---

## 🚀 迁移步骤（预计 1-2 小时）

### 步骤 1: 创建 Supabase 项目（5分钟）

1. 访问 https://supabase.com/
2. 点击 "Start your project"
3. 使用 GitHub 账号登录
4. 点击 "New Project"
5. 填写项目信息：
   - Name: `xogs`
   - Database Password: 设置一个强密码（保存好！）
   - Region: 选择最近的区域（如 Singapore 或 Tokyo）
6. 点击 "Create new project"
7. 等待项目创建完成（约 2 分钟）

### 步骤 2: 获取数据库连接信息（2分钟）

1. 在 Supabase 项目中，点击左侧 "Settings"
2. 点击 "Database"
3. 找到 "Connection string" 部分
4. 选择 "URI" 模式
5. 复制连接字符串（类似这样）：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
6. 记下这个连接字符串

### 步骤 3: 备份 Neon 数据（10分钟）

**在本地运行**：

```bash
# 导出 Neon 数据库
pg_dump "your-neon-connection-string" > neon_backup.sql

# 或者使用 Prisma
npx prisma db pull
```

### 步骤 4: 迁移数据到 Supabase（15分钟）

#### 方法 A: 使用 Prisma Migrate（推荐）

```bash
cd /Users/a1/xogs

# 1. 更新环境变量（临时）
export DATABASE_URL="your-supabase-connection-string"

# 2. 推送 schema 到 Supabase
npx prisma db push

# 3. 验证 schema
npx prisma studio
```

#### 方法 B: 直接导入 SQL

```bash
# 导入到 Supabase
psql "your-supabase-connection-string" < neon_backup.sql
```

### 步骤 5: 迁移数据（20分钟）

**使用 Prisma 迁移数据**：

创建迁移脚本 `scripts/migrate-data.ts`：

```typescript
import { PrismaClient as NeonPrisma } from '@prisma/client'

// Neon 连接
const neonPrisma = new NeonPrisma({
  datasources: {
    db: {
      url: process.env.NEON_DATABASE_URL
    }
  }
})

// Supabase 连接
const supabasePrisma = new NeonPrisma({
  datasources: {
    db: {
      url: process.env.SUPABASE_DATABASE_URL
    }
  }
})

async function migrateData() {
  console.log('开始迁移数据...')
  
  // 1. 迁移用户
  const users = await neonPrisma.user.findMany()
  console.log(`迁移 ${users.length} 个用户...`)
  for (const user of users) {
    await supabasePrisma.user.upsert({
      where: { id: user.id },
      create: user,
      update: user
    })
  }
  
  // 2. 迁移任务
  const tasks = await neonPrisma.tasks.findMany()
  console.log(`迁移 ${tasks.length} 个任务...`)
  for (const task of tasks) {
    await supabasePrisma.tasks.upsert({
      where: { id: task.id },
      create: task,
      update: task
    })
  }
  
  // 3. 迁移其他表...
  // 重复以上步骤
  
  console.log('数据迁移完成！')
}

migrateData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('迁移失败:', error)
    process.exit(1)
  })
```

**运行迁移**：

```bash
# 设置环境变量
export NEON_DATABASE_URL="your-neon-connection-string"
export SUPABASE_DATABASE_URL="your-supabase-connection-string"

# 运行迁移脚本
npx ts-node scripts/migrate-data.ts
```

### 步骤 6: 更新代码配置（5分钟）

#### 1. 更新 Vercel 环境变量

1. 登录 Vercel
2. 进入您的项目
3. Settings → Environment Variables
4. 更新 `DATABASE_URL` 为 Supabase 连接字符串
5. 添加连接池参数（推荐）：
   ```
   postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:6543/postgres?pgbouncer=true
   ```
   注意：连接池端口是 **6543**，不是 5432

#### 2. 更新本地 `.env.local`

```env
# 替换为 Supabase 连接字符串
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:6543/postgres?pgbouncer=true"
```

#### 3. Prisma 配置已兼容，无需修改

您当前的 `prisma.ts` 配置已经兼容 Supabase，无需改动！

### 步骤 7: 测试验证（10分钟）

```bash
# 1. 测试连接
npx prisma db pull

# 2. 生成 Prisma Client
npx prisma generate

# 3. 本地测试
npm run dev

# 4. 验证功能
# - 用户登录
# - 查看数据
# - AI 评分计算
# - 任务系统
```

### 步骤 8: 部署上线（5分钟）

```bash
# 提交更改（如果有）
git add .
git commit -m "migrate: switch to Supabase database"
git push

# Vercel 会自动部署
```

---

## 🔧 保持 Supabase 免费数据库活跃

免费版会在 1 周不活动后暂停，解决方案：

### 方案 A: Vercel Cron Job（推荐）

创建 `app/api/keep-alive/route.ts`：

```typescript
export const runtime = 'edge'

export async function GET() {
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  
  try {
    // 简单查询保持数据库活跃
    await prisma.$queryRaw`SELECT 1`
    return Response.json({ status: 'ok', timestamp: new Date() })
  } finally {
    await prisma.$disconnect()
  }
}
```

在 `vercel.json` 中配置定时任务：

```json
{
  "crons": [
    {
      "path": "/api/keep-alive",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### 方案 B: 外部监控服务

使用免费服务如 UptimeRobot 或 Cron-job.org 每天 ping 一次您的 API。

---

## 💰 费用对比

### 优化前（Neon 无优化）
```
月费用: $186
计算时间: 1,344 小时
```

### 优化后（Neon + 自动暂停）
```
月费用: $20-30（或免费，如果在 300 小时内）
计算时间: 60-120 小时
节省: $156-166/月
```

### 迁移到 Supabase
```
月费用: $0 ✅
存储: 500 MB（免费）
计算: 无限制（免费）
节省: $186/月 ✅
```

---

## ⚠️ 迁移注意事项

### 1. 数据一致性
- ✅ 迁移前完整备份
- ✅ 迁移后验证数据完整性
- ✅ 保留 Neon 数据库至少 1 周作为备份

### 2. 连接字符串差异
```
Neon: 
postgresql://user:pass@xxx.neon.tech/db

Supabase:
postgresql://postgres:pass@db.xxx.supabase.co:6543/postgres?pgbouncer=true
                                            ^^^^
                                            连接池端口
```

### 3. 性能考虑
- Supabase 免费版连接数限制：60 并发
- 建议使用连接池（端口 6543）
- 首次请求可能稍慢（冷启动）

### 4. 回滚计划
如果迁移失败，保留 Neon 连接信息：
```bash
# 快速回滚
export DATABASE_URL="your-neon-connection-string"
git revert HEAD
git push
```

---

## 📊 迁移检查清单

### 迁移前
- [ ] 创建 Supabase 项目
- [ ] 获取连接字符串
- [ ] 备份 Neon 数据
- [ ] 测试 Supabase 连接

### 迁移中
- [ ] 推送 schema 到 Supabase
- [ ] 迁移所有数据
- [ ] 验证数据完整性
- [ ] 更新环境变量

### 迁移后
- [ ] 本地测试所有功能
- [ ] 部署到 Vercel
- [ ] 验证生产环境
- [ ] 监控 1 周
- [ ] 设置保活任务
- [ ] 关闭 Neon 项目

---

## 🆘 故障排除

### 问题 1: 连接超时
**解决**: 使用连接池端口 6543 而不是 5432

### 问题 2: Prisma 生成失败
**解决**: 
```bash
rm -rf node_modules/.prisma
npx prisma generate --schema=./prisma/schema.prisma
```

### 问题 3: 数据迁移失败
**解决**: 使用手动 SQL 导出/导入

### 问题 4: 数据库被暂停
**解决**: 设置 Vercel Cron Job 保持活跃

---

## 📞 需要帮助？

- **Supabase 文档**: https://supabase.com/docs
- **Prisma + Supabase**: https://www.prisma.io/docs/guides/database/supabase
- **社区支持**: https://github.com/supabase/supabase/discussions

---

**预计迁移时间**: 1-2 小时  
**预计节省**: $186/月  
**风险级别**: 低（PostgreSQL 兼容）  
**推荐指数**: ⭐⭐⭐⭐⭐

