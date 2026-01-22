# TikTok影响力评分平台 - 邀请机制详细设计

## 🎯 邀请系统概述

### 设计目标
- **病毒式传播**: 通过邀请机制实现用户快速增长
- **公平奖励**: 邀请者和被邀请者都能获得合理奖励
- **防刷机制**: 防止恶意刷邀请和虚假注册
- **用户体验**: 简单易用的邀请流程

### 核心原则
- **双赢机制**: 邀请者和被邀请者都有收益
- **阶梯奖励**: 根据被邀请者质量给予不同奖励
- **长期激励**: 建立持续的邀请激励机制
- **数据透明**: 邀请数据完全透明可查

## 🚀 邀请机制设计

### 1. 邀请奖励结构

#### 邀请者奖励
```
基础奖励 = 被邀请者AI评分 × 3
额外奖励 = 被邀请者首次评分 × 1
总奖励 = 基础奖励 + 额外奖励
```

#### 被邀请者奖励
```
基础奖励 = 自己AI评分 × 2
邀请奖励 = 邀请者AI评分 × 1
总奖励 = 基础奖励 + 邀请奖励
```

#### 奖励示例
假设邀请者AI评分为50分，被邀请者AI评分为30分：

**邀请者获得**:
- 基础奖励: 30 × 3 = 90 TIKTOK
- 额外奖励: 30 × 1 = 30 TIKTOK
- 总奖励: 120 TIKTOK

**被邀请者获得**:
- 基础奖励: 30 × 2 = 60 TIKTOK
- 邀请奖励: 50 × 1 = 50 TIKTOK
- 总奖励: 110 TIKTOK

### 2. 邀请流程设计

#### 邀请生成流程
1. **用户登录**: 用户通过TikTok OAuth登录
2. **生成邀请码**: 系统自动生成唯一邀请码
3. **创建邀请链接**: 格式为 `https://tiktok-score.vercel.app/invite/{code}`
4. **分享邀请**: 用户可通过多种方式分享邀请链接

#### 邀请接受流程
1. **访问邀请链接**: 好友点击邀请链接
2. **TikTok登录**: 好友使用TikTok账号登录
3. **验证邀请码**: 系统验证邀请码有效性
4. **建立邀请关系**: 自动绑定邀请者和被邀请者
5. **计算奖励**: 根据双方AI评分计算奖励
6. **发放奖励**: 双方同时获得代币奖励
7. **更新统计**: 更新邀请统计和排行榜

#### 邀请验证机制
- **邀请码唯一性**: 每个邀请码只能使用一次
- **时间限制**: 邀请码有效期7天
- **用户限制**: 同一TikTok账号只能被邀请一次
- **IP限制**: 防止同一IP大量注册
- **设备限制**: 防止同一设备多次注册

### 3. 邀请统计系统

#### 个人邀请统计
```typescript
interface InviteStats {
  totalInvites: number;        // 总邀请数
  successfulInvites: number;   // 成功邀请数
  totalRewards: number;        // 总奖励
  conversionRate: number;      // 转化率
  averageScore: number;        // 被邀请者平均评分
  inviteHistory: InviteRecord[]; // 邀请历史
}
```

#### 邀请历史记录
```typescript
interface InviteRecord {
  id: string;
  inviteeId: string;
  inviteeUsername: string;
  inviteeScore: number;
  reward: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}
```

### 4. 邀请排行榜

#### 排行榜类型
1. **邀请数量排行榜**: 按成功邀请人数排序
2. **邀请奖励排行榜**: 按邀请获得的总奖励排序
3. **转化率排行榜**: 按邀请成功率排序
4. **平均评分排行榜**: 按被邀请者平均评分排序

#### 排行榜更新机制
- **实时更新**: 邀请完成后立即更新排行榜
- **定时刷新**: 每小时刷新一次排行榜数据
- **缓存优化**: 使用Redis缓存排行榜数据
- **分页显示**: 支持分页和搜索功能

## 🛠 技术实现

### 1. 数据库设计

#### 邀请表结构
```sql
-- 邀请记录表
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL UNIQUE,
    "inviteCode" TEXT NOT NULL UNIQUE,
    "status" TEXT DEFAULT 'pending',
    "reward" DECIMAL DEFAULT 0,
    "inviterReward" DECIMAL DEFAULT 0,
    "inviteeReward" DECIMAL DEFAULT 0,
    "inviteeScore" INTEGER DEFAULT 0,
    "expiresAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("inviterId") REFERENCES "User"("id"),
    FOREIGN KEY ("inviteeId") REFERENCES "User"("id")
);

-- 邀请码表
CREATE TABLE "InviteCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL UNIQUE,
    "isUsed" BOOLEAN DEFAULT false,
    "expiresAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("userId") REFERENCES "User"("id")
);

-- 邀请统计表
CREATE TABLE "InviteStats" (
    "userId" TEXT NOT NULL,
    "totalInvites" INTEGER DEFAULT 0,
    "successfulInvites" INTEGER DEFAULT 0,
    "totalRewards" DECIMAL DEFAULT 0,
    "conversionRate" DECIMAL DEFAULT 0,
    "averageScore" DECIMAL DEFAULT 0,
    "lastInviteAt" TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("userId"),
    FOREIGN KEY ("userId") REFERENCES "User"("id")
);
```

### 2. API接口设计

#### 邀请相关API
```typescript
// 生成邀请码
POST /api/invite/generate
Response: {
  code: string;
  inviteUrl: string;
  expiresAt: Date;
}

// 验证邀请码
GET /api/invite/validate/{code}
Response: {
  isValid: boolean;
  inviterInfo: {
    username: string;
    score: number;
  };
  expiresAt: Date;
}

// 接受邀请
POST /api/invite/accept/{code}
Response: {
  success: boolean;
  rewards: {
    inviterReward: number;
    inviteeReward: number;
  };
}

// 获取邀请统计
GET /api/invite/stats
Response: {
  totalInvites: number;
  successfulInvites: number;
  totalRewards: number;
  conversionRate: number;
  inviteHistory: InviteRecord[];
}

// 获取邀请排行榜
GET /api/invite/leaderboard
Query: {
  type: 'count' | 'reward' | 'conversion' | 'average';
  page: number;
  limit: number;
}
Response: {
  leaderboard: LeaderboardEntry[];
  total: number;
  page: number;
}
```

### 3. 前端组件设计

#### 邀请系统组件
```typescript
// 邀请卡片组件
interface InviteCardProps {
  inviteCode: string;
  inviteUrl: string;
  stats: InviteStats;
  onShare: (url: string) => void;
}

// 邀请历史组件
interface InviteHistoryProps {
  history: InviteRecord[];
  loading: boolean;
  onLoadMore: () => void;
}

// 邀请排行榜组件
interface InviteLeaderboardProps {
  type: 'count' | 'reward' | 'conversion' | 'average';
  data: LeaderboardEntry[];
  loading: boolean;
}
```

### 4. 邀请码生成算法

#### 邀请码格式
```typescript
// 邀请码生成规则
function generateInviteCode(userId: string): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  const userIdHash = hashUserId(userId).substring(0, 4);
  
  return `${timestamp}${randomStr}${userIdHash}`.toUpperCase();
}

// 邀请码验证
function validateInviteCode(code: string): boolean {
  // 检查格式
  if (!/^[A-Z0-9]{12}$/.test(code)) return false;
  
  // 检查是否过期
  const timestamp = parseInt(code.substring(0, 8), 36);
  const now = Date.now();
  const expiresAt = timestamp + (7 * 24 * 60 * 60 * 1000); // 7天
  
  return now < expiresAt;
}
```

## 🔐 安全机制

### 1. 防刷机制

#### 注册限制
- **IP限制**: 同一IP每小时最多注册5个账号
- **设备限制**: 同一设备24小时内最多注册3个账号
- **手机号验证**: 重要操作需要手机号验证
- **邮箱验证**: 注册后需要邮箱验证

#### 邀请限制
- **邀请频率**: 每小时最多发送10个邀请
- **邀请质量**: 被邀请者需要完成基础任务才能激活邀请奖励
- **邀请验证**: 邀请完成后需要双方确认
- **奖励延迟**: 邀请奖励延迟24小时发放，防止刷奖励

### 2. 数据验证

#### 用户数据验证
```typescript
// TikTok账号验证
async function validateTikTokAccount(tiktokId: string): Promise<boolean> {
  // 检查账号真实性
  const accountInfo = await getTikTokAccountInfo(tiktokId);
  
  // 验证条件
  const isValid = 
    accountInfo.followersCount > 0 &&
    accountInfo.videoCount > 0 &&
    accountInfo.createdAt < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 至少7天前注册
    
  return isValid;
}

// AI评分验证
function validateAIScore(score: number): boolean {
  return score >= 0 && score <= 100;
}
```

#### 邀请数据验证
```typescript
// 邀请关系验证
async function validateInviteRelation(inviterId: string, inviteeId: string): Promise<boolean> {
  // 检查是否已经存在邀请关系
  const existingInvite = await prisma.invite.findFirst({
    where: {
      OR: [
        { inviterId, inviteeId },
        { inviterId: inviteeId, inviteeId: inviterId }
      ]
    }
  });
  
  return !existingInvite;
}
```

### 3. 异常处理

#### 错误类型
```typescript
enum InviteError {
  INVALID_CODE = 'INVALID_CODE',
  EXPIRED_CODE = 'EXPIRED_CODE',
  ALREADY_INVITED = 'ALREADY_INVITED',
  SELF_INVITE = 'SELF_INVITE',
  RATE_LIMIT = 'RATE_LIMIT',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS'
}
```

#### 错误处理策略
- **用户友好提示**: 提供清晰的错误信息
- **自动重试**: 网络错误时自动重试
- **降级处理**: 邀请失败时提供备选方案
- **日志记录**: 详细记录错误信息用于调试

## 📊 数据分析

### 1. 邀请效果指标

#### 核心指标
- **邀请转化率**: 成功邀请数 / 总邀请数
- **平均邀请奖励**: 总邀请奖励 / 成功邀请数
- **邀请活跃度**: 有邀请行为的用户比例
- **邀请传播深度**: 平均邀请层级深度

#### 用户行为分析
- **邀请时机**: 用户注册后多久开始邀请
- **邀请渠道**: 主要通过哪些渠道分享邀请
- **邀请对象**: 被邀请者的特征分析
- **邀请动机**: 用户邀请的主要动机

### 2. 优化策略

#### 邀请流程优化
- **简化流程**: 减少邀请步骤，提高转化率
- **视觉优化**: 优化邀请页面设计
- **社交分享**: 集成更多社交平台分享
- **激励机制**: 根据用户行为调整奖励

#### 防刷优化
- **智能检测**: 使用AI检测异常行为
- **动态限制**: 根据用户行为动态调整限制
- **举报机制**: 用户可举报恶意行为
- **人工审核**: 重要邀请进行人工审核

## 🎯 运营策略

### 1. 邀请活动

#### 活动类型
- **新用户邀请活动**: 新用户注册后7天内邀请奖励翻倍
- **节日邀请活动**: 重要节日期间邀请奖励增加
- **KOL邀请活动**: 邀请知名用户获得额外奖励
- **社区邀请活动**: 社区成员邀请获得特殊奖励

#### 活动设计
- **时间限制**: 活动有明确的时间限制
- **奖励梯度**: 根据邀请数量设置不同奖励梯度
- **特殊奖励**: 提供独特的奖励和权益
- **社交传播**: 鼓励用户在社交媒体分享

### 2. 用户教育

#### 邀请指南
- **邀请技巧**: 提供有效的邀请方法
- **奖励说明**: 详细说明奖励机制
- **常见问题**: 解答用户常见疑问
- **成功案例**: 分享成功的邀请案例

#### 社区建设
- **邀请群组**: 建立邀请相关的用户群组
- **经验分享**: 用户分享邀请经验
- **互助机制**: 用户间互相帮助
- **官方支持**: 官方提供技术支持

## 🔮 未来扩展

### 1. 高级邀请功能

#### 多级邀请
- **二级邀请**: 被邀请者邀请其他人
- **团队奖励**: 团队邀请获得额外奖励
- **层级管理**: 管理多级邀请关系
- **团队统计**: 团队邀请数据统计

#### 邀请任务
- **邀请任务**: 完成特定邀请任务获得奖励
- **邀请挑战**: 参与邀请挑战活动
- **邀请竞赛**: 邀请竞赛获得排名奖励
- **邀请徽章**: 邀请成就徽章系统

### 2. 社交功能

#### 邀请社交
- **邀请动态**: 显示邀请相关动态
- **邀请评论**: 对邀请进行评论
- **邀请点赞**: 点赞邀请动态
- **邀请分享**: 分享邀请到其他平台

#### 社区功能
- **邀请社区**: 建立邀请相关社区
- **邀请论坛**: 邀请相关讨论论坛
- **邀请活动**: 社区邀请活动
- **邀请直播**: 邀请相关直播内容

---

**文档版本**: v1.0
**最后更新**: 2024年12月
**负责人**: [产品经理]

---

*本邀请机制设计将根据实际运营数据和用户反馈持续优化* 