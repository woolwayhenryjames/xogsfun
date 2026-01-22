# 持续流量场景下的 Neon 优化方案

## 📊 问题诊断

### 异常数据分析
```
月计算时间: 1,343.79 小时
天数: 31 天
平均每天: 43.3 小时 ⚠️

一天只有 24 小时！
这说明问题不是流量，而是并发连接数过多。
```

### 计算方式
```
Neon 计费 = 所有活跃连接的时间总和
43.3 小时/天 ÷ 24 小时/天 = 平均 1.8 个并发连接
```

---

## 🔍 诊断步骤：检查实际连接情况

### 步骤 1: 查看当前连接数

在 Neon 控制台运行此 SQL：

```sql
-- 查看当前所有连接
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    state_change,
    NOW() - state_change as duration,
    query
FROM pg_stat_activity
WHERE datname = current_database()
ORDER BY state_change;
```

**正常情况应该看到**：
- 0-3 个 active 连接
- 0-2 个 idle 连接

**异常情况会看到**：
- ❌ 大量 idle 连接
- ❌ 连接存在很长时间（duration > 1 小时）
- ❌ 相同 client_addr 有多个连接

### 步骤 2: 监控一天的连接模式

```sql
-- 查看连接统计
SELECT 
    state,
    count(*) as connection_count,
    max(NOW() - state_change) as max_duration
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state;
```

保存结果，每隔几小时运行一次，观察模式。

---

## 💡 优化方案（按优先级）

### 🔥 方案 1: 使用 Neon Pooled Connection（最重要！）

**原理**: 连接池可以复用连接，大幅减少并发连接数

**效果预估**:
```
当前: 平均 1.8 个并发连接 × 24 小时 × 31 天 = 1,339 小时
优化后: 平均 0.3 个并发连接 × 24 小时 × 31 天 = 223 小时
节省: 83% ✅
```

**操作步骤**:

1. **获取 Pooled Connection 字符串**
   - Neon 控制台 → Connection Details
   - 选择 "Pooled connection" 标签
   - 复制连接字符串

2. **更新 Vercel 环境变量**
   ```
   原来: postgresql://user:pass@xxx.neon.tech/db
   改为: postgresql://user:pass@xxx-pooler.neon.tech/db?pgbouncer=true
   ```

3. **添加连接限制参数**
   ```
   DATABASE_URL="postgresql://user:pass@xxx-pooler.neon.tech/db?pgbouncer=true&connection_limit=10&pool_timeout=20"
   ```

4. **重新部署**
   ```bash
   # Vercel 会自动重新部署
   ```

---

### 🔥 方案 2: 优化 Vercel 无服务器函数

Vercel 的每个函数调用可能创建新连接，导致连接数过多。

**在 `next.config.js` 中添加**:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... 现有配置
  
  // 优化无服务器函数
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    serverActions: true,
  },
  
  // 限制并发函数数量
  serverRuntimeConfig: {
    maxDuration: 10, // 函数最长运行 10 秒
  },
}

module.exports = nextConfig
```

---

### 🔥 方案 3: 改进 Prisma 连接管理

更新 `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    // 添加连接池配置
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
  var prismaConnectionCount: number
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// 自动清理连接
if (typeof window === 'undefined') {
  // 记录活跃连接数
  globalThis.prismaConnectionCount = (globalThis.prismaConnectionCount || 0) + 1
  
  const cleanup = async () => {
    console.log('Cleaning up database connections...')
    await prisma.$disconnect()
    globalThis.prismaConnectionCount = Math.max(0, (globalThis.prismaConnectionCount || 1) - 1)
  }

  process.on('beforeExit', cleanup)
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
  
  // Vercel 特定：函数执行完毕后清理
  if (process.env.VERCEL) {
    // 设置 30 秒超时，强制清理长时间运行的连接
    setTimeout(async () => {
      if (globalThis.prismaConnectionCount > 0) {
        console.warn('Force disconnecting idle connections...')
        await cleanup()
      }
    }, 30000)
  }
}

export default prisma
```

---

### 🟡 方案 4: 启用自动暂停（仍然推荐！）

**即使有持续流量，仍然建议启用**

**原因**:
1. **流量不可能完全均匀**: 必然有低谷期
   - 凌晨 2-6 点（中国时区）
   - 节假日
   - 维护时段

2. **5 分钟暂停阈值可以调整**:
   - 如果 5 分钟太短，改为 15 分钟
   - 在低流量时段仍能节省费用

3. **与连接池优化叠加**:
   - 连接池减少并发连接
   - 自动暂停在低谷期节省费用
   - 两者结合效果最佳

**建议配置**:
```
Auto-suspend: 启用
Suspend after: 15 minutes（而不是 5 分钟）
Auto-wake: 启用
```

---

## 📊 综合优化效果预估

### 场景 1: 只用 Pooled Connection
```
当前费用: $186/月
优化后: $30-50/月
节省: $136-156/月 (73-84%)
```

### 场景 2: Pooled Connection + 自动暂停
```
当前费用: $186/月
优化后: $5-20/月
节省: $166-181/月 (89-97%)
```

### 场景 3: 迁移到 Supabase
```
当前费用: $186/月
优化后: $0/月
节省: $186/月 (100%) ✅
```

---

## 🎯 推荐执行顺序

### 第一步：立即执行（今天）
1. ✅ 使用 Pooled Connection（10 分钟）
2. ✅ 添加连接限制参数（5 分钟）
3. ✅ 更新 Prisma 配置（5 分钟）
4. ✅ 部署到 Vercel（自动）

**预期效果**: 费用降到 $30-50/月

### 第二步：观察一周
1. 监控 Neon Metrics 的连接数
2. 查看计算时间是否下降
3. 运行 SQL 诊断连接情况

### 第三步：进一步优化
**如果费用仍 > $30/月**:
- 考虑启用自动暂停（15 分钟）
- 或迁移到 Supabase（完全免费）

---

## 📝 验证清单

### 优化前检查
```bash
# 在 Neon 控制台运行
SELECT count(*) FROM pg_stat_activity WHERE datname = current_database();

# 记录当前连接数
```

### 优化后验证（24小时后）
```bash
# 再次运行
SELECT count(*) FROM pg_stat_activity WHERE datname = current_database();

# 应该看到连接数显著减少
# 从 ~2 个降到 ~0.3 个
```

### 费用验证（一周后）
1. Neon 控制台 → Billing
2. 查看当前周期预估费用
3. 应该显示 $30-50（或更低）

---

## 💡 关键结论

### 对于您的情况：

✅ **自动暂停仍然有用**
- 即使有持续流量，也必然有低谷期
- 配置 15 分钟暂停时间更合适
- 可以在凌晨和节假日节省费用

✅ **Pooled Connection 更关键**
- 这是降低费用的核心
- 可以减少 70-80% 的计算时间
- 必须立即实施

✅ **两者结合效果最佳**
- Pooled Connection: 减少并发连接
- 自动暂停: 在低谷期停止计费
- 预计总节省: 85-95%

---

## 🆘 如果优化后费用仍然很高

### 终极方案：迁移到 Supabase

**优势**:
- ✅ 完全免费（500MB 存储，无限计算）
- ✅ PostgreSQL 完全兼容
- ✅ 1-2 小时即可完成迁移
- ✅ 零月费用

**查看迁移指南**:
- [MIGRATION_TO_SUPABASE_GUIDE.md](./MIGRATION_TO_SUPABASE_GUIDE.md)

---

**更新时间**: 2025-11-02  
**适用场景**: 持续高流量应用  
**预期节省**: $136-186/月 (73-100%)

