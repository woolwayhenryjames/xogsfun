# TikTok影响力评分平台 - 项目需求文档

## 🎯 项目概述

### 项目名称
**TIKTOK SCORE** - 基于TikTok账号质量评分的免费代币分发平台

### 项目定位
一个革命性的AI驱动社交影响力评估协议，专门针对TikTok生态系统，通过智能算法评估用户TikTok账号质量，并基于评分分发免费代币。

### 核心价值主张
- **TikTok专属评分**: 专门针对TikTok平台设计的AI评分算法
- **免费代币分发**: 基于账号质量免费分发代币奖励
- **邀请激励机制**: 完善的邀请系统，鼓励用户邀请好友参与
- **Solana区块链**: 基于高性能Solana区块链构建

## 🚀 核心功能特性

### 1. TikTok OAuth登录系统
- **OAuth 2.0集成**: 使用TikTok官方OAuth API进行用户认证
- **权限范围**: 
  - `user.info.basic` - 基础用户信息
  - `user.info.stats` - 用户统计数据
  - `video.list` - 视频列表访问
  - `user.info.profile` - 用户资料信息
- **安全认证**: 支持access token和refresh token机制
- **用户数据获取**: 自动获取用户TikTok账号的完整信息

### 2. TikTok账号质量AI评分系统
#### 评分维度 (总分100分)

**1. 账号年龄 (20分)**
- 计算公式: (当前年份 - 注册年份) × 2分
- 最多不超过20分
- 体现账号的长期价值

**2. 粉丝数量 (40分)**
- 分级评分系统:
  - 0-1万粉丝: 粉丝数 ÷ 1万 × 10分
  - 1-10万粉丝: 10 + (粉丝数 - 1万) ÷ 9万 × 15分
  - 10-100万粉丝: 25 + (粉丝数 - 10万) ÷ 90万 × 10分
  - 100万+粉丝: 35 + (粉丝数 - 100万) ÷ 100万 × 5分 (最多40分)

**3. 视频内容质量 (20分)**
- 视频数量评分 (10分):
  - 50-500个视频: 满分10分
  - 少于50个: 按比例得分
  - 超过500个: 每多1000个扣2分
- 平均播放量评分 (10分):
  - 播放量/粉丝数比例在0.1-2之间: 满分10分
  - 超出范围按log10距离扣分

**4. 互动率 (15分)**
- 点赞率评分 (8分): 点赞数/播放量比例
- 评论率评分 (7分): 评论数/播放量比例
- 最优比例范围: 0.05-0.15

**5. 账号认证状态 (5分)**
- 官方认证账号: 5分
- 普通账号: 0分

#### 评分等级
- **80-100分**: 顶级影响力
- **60-79分**: 优秀影响力
- **40-59分**: 良好影响力
- **20-39分**: 一般影响力
- **0-19分**: 待提升

### 3. 邀请激励机制

#### 邀请系统设计
**邀请者奖励**:
- 获得被邀请者AI评分 × 3 的代币奖励
- 额外获得被邀请者首次评分 × 1 的奖励

**被邀请者奖励**:
- 获得自己AI评分 × 2 的代币奖励
- 获得邀请者AI评分 × 1 的奖励

#### 邀请流程
1. **生成邀请码**: 用户可生成专属邀请链接
2. **分享邀请**: 通过社交媒体分享邀请链接
3. **好友注册**: 好友通过邀请链接注册
4. **自动绑定**: 系统自动建立邀请关系
5. **奖励发放**: 双方获得相应代币奖励

#### 邀请统计
- 邀请人数统计
- 邀请奖励总额
- 邀请成功率
- 邀请排行榜

### 4. 代币系统 (TIKTOK Token)

#### 代币分配机制
**基础分配**:
- 用户AI评分 × 10 = 基础代币数量
- 邀请奖励: 按邀请机制计算
- 每日签到奖励: 基础评分 × 0.1

**特殊奖励**:
- 新用户注册奖励: 100 TIKTOK
- 完成TikTok任务奖励: 50-200 TIKTOK
- 社区贡献奖励: 根据贡献度分配

#### 代币用途
- 平台治理投票
- 高级功能解锁
- 社区活动参与
- 未来生态建设

### 5. 任务系统

#### 任务类型
**1. 社交任务**
- 关注官方TikTok账号
- 分享平台内容
- 邀请好友注册
- 参与社区讨论

**2. 内容任务**
- 发布指定主题视频
- 使用平台标签
- 参与挑战活动
- 创作原创内容

**3. 互动任务**
- 点赞官方内容
- 评论互动
- 转发分享
- 参与直播

#### 任务奖励
- 完成任务获得代币奖励
- 连续完成获得额外奖励
- 特殊任务获得稀有奖励

### 6. 排行榜系统

#### 排行榜类型
**1. AI评分排行榜**
- 按AI评分高低排序
- 显示用户基本信息
- 实时更新排名

**2. 邀请排行榜**
- 按邀请人数排序
- 显示邀请奖励
- 邀请成功率统计

**3. 代币余额排行榜**
- 按代币余额排序
- 显示财富增长
- 投资回报率

#### 排行榜功能
- 实时更新
- 分页显示
- 搜索功能
- 筛选功能

## 🛠 技术架构

### 前端技术栈
- **框架**: Next.js 14 + React 18
- **语言**: TypeScript
- **样式**: TailwindCSS
- **状态管理**: React Hooks + Context
- **UI组件**: 自定义组件库

### 后端技术栈
- **API框架**: Next.js API Routes
- **数据库**: PostgreSQL (Neon)
- **ORM**: Prisma
- **认证**: NextAuth.js
- **区块链**: Solana Web3.js

### 第三方集成
- **TikTok API**: 官方OAuth和内容API
- **Solana**: 钱包连接和交易
- **Vercel**: 部署和CDN
- **Neon**: 数据库服务

### 数据库设计

#### 核心表结构
```sql
-- 用户表
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tiktokId" TEXT NOT NULL UNIQUE,
    "username" TEXT,
    "displayName" TEXT,
    "profileImageUrl" TEXT,
    "bio" TEXT,
    "followersCount" INTEGER,
    "followingCount" INTEGER,
    "videoCount" INTEGER,
    "likeCount" INTEGER,
    "verified" BOOLEAN DEFAULT false,
    "tiktokCreatedAt" TIMESTAMP,
    "aiScore" INTEGER DEFAULT 0,
    "tiktokBalance" INTEGER DEFAULT 0,
    "inviterId" TEXT,
    "inviteCode" TEXT UNIQUE,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP,
    "solanaAddress" TEXT UNIQUE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

-- 邀请表
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL UNIQUE,
    "reward" DECIMAL DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("inviterId") REFERENCES "User"("id"),
    FOREIGN KEY ("inviteeId") REFERENCES "User"("id")
);

-- 任务表
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "reward" INTEGER DEFAULT 0,
    "requirements" JSONB,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

-- 用户任务表
CREATE TABLE "UserTask" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "status" TEXT DEFAULT 'pending',
    "completedAt" TIMESTAMP,
    "reward" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("userId") REFERENCES "User"("id"),
    FOREIGN KEY ("taskId") REFERENCES "Task"("id")
);
```

## 📱 用户界面设计

### 设计原则
- **移动端优先**: 专为移动设备优化
- **现代化UI**: 渐变色彩、毛玻璃效果
- **流畅动画**: 60fps动画效果
- **直观操作**: 简单易用的交互设计

### 页面结构
```
/
├── 首页 (产品介绍和登录)
├── /dashboard (用户主界面)
│   ├── 概览页面
│   ├── 个人资料
│   ├── 邀请系统
│   └── 排行榜
├── /profile (个人资料)
├── /ai-score (AI评分详情)
├── /solana (钱包连接)
├── /tasks (任务中心)
├── /leaderboard (排行榜)
└── /invite/[code] (邀请页面)
```

### 核心组件
- **TikTok登录按钮**: 集成TikTok OAuth
- **AI评分卡片**: 显示评分详情和计算过程
- **邀请系统**: 生成和分享邀请链接
- **任务中心**: 任务列表和完成状态
- **排行榜**: 多维度排行榜展示
- **钱包连接**: Solana钱包集成

## 🔐 安全与隐私

### 数据安全
- **OAuth认证**: 使用TikTok官方OAuth流程
- **Token加密**: 敏感信息加密存储
- **HTTPS传输**: 所有数据传输使用HTTPS
- **权限控制**: 最小权限原则

### 隐私保护
- **数据最小化**: 只收集必要数据
- **用户同意**: 明确的数据使用同意
- **数据删除**: 支持用户数据删除
- **透明度**: 清晰的数据使用说明

## 📊 数据分析

### 关键指标
- **用户注册数**: 每日/每周/每月注册用户
- **AI评分分布**: 用户评分分布统计
- **邀请转化率**: 邀请成功率分析
- **代币分发**: 代币分发统计
- **用户活跃度**: 日活/周活/月活用户

### 监控系统
- **性能监控**: 页面加载时间和API响应时间
- **错误监控**: 错误日志和异常处理
- **用户行为**: 用户操作路径分析
- **业务指标**: 关键业务指标实时监控

## 🚀 部署计划

### 开发阶段
**第一阶段 (2周)**
- 项目初始化和基础架构搭建
- TikTok OAuth集成
- 基础用户系统开发

**第二阶段 (3周)**
- AI评分算法开发
- 邀请系统实现
- 任务系统开发

**第三阶段 (2周)**
- 排行榜系统
- 钱包集成
- UI/UX优化

**第四阶段 (1周)**
- 测试和调试
- 性能优化
- 部署上线

### 部署环境
- **开发环境**: Vercel Preview
- **测试环境**: Vercel Staging
- **生产环境**: Vercel Production

### 环境变量配置
```env
# TikTok API
TIKTOK_CLIENT_ID=your-tiktok-client-id
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret

# NextAuth
NEXTAUTH_URL=https://tiktok-score.vercel.app
NEXTAUTH_SECRET=your-secret-key

# 数据库
DATABASE_URL=your-neon-database-url

# Solana
SOLANA_RPC_URL=your-solana-rpc-url
```

## 📈 运营策略

### 用户获取
- **社交媒体营销**: TikTok、Twitter、Telegram
- **KOL合作**: 与TikTok网红合作推广
- **社区建设**: 建立用户社区和讨论群
- **口碑传播**: 通过邀请机制实现病毒式传播

### 用户留存
- **每日签到**: 连续签到奖励机制
- **任务系统**: 丰富的任务和奖励
- **社区互动**: 用户间互动和竞争
- **内容更新**: 定期更新功能和内容

### 变现模式
- **广告收入**: 平台广告位销售
- **数据服务**: 匿名数据分析服务
- **企业合作**: 与品牌方合作推广
- **代币经济**: 代币生态系统建设

## 🎯 成功指标

### 短期目标 (3个月)
- 注册用户数: 10,000+
- 日活跃用户: 1,000+
- 邀请转化率: 30%+
- 用户评分分布: 平均40分以上

### 中期目标 (6个月)
- 注册用户数: 50,000+
- 日活跃用户: 5,000+
- 邀请转化率: 40%+
- 代币分发总量: 1,000,000+

### 长期目标 (12个月)
- 注册用户数: 200,000+
- 日活跃用户: 20,000+
- 邀请转化率: 50%+
- 平台估值: $10M+

## 🔮 未来规划

### 功能扩展
- **多平台支持**: 扩展到Instagram、YouTube等平台
- **NFT集成**: 用户影响力NFT化
- **DeFi功能**: 代币质押和流动性挖矿
- **DAO治理**: 社区治理和投票系统

### 技术升级
- **AI算法优化**: 更精准的评分算法
- **区块链升级**: 支持更多区块链网络
- **移动应用**: 原生移动应用开发
- **API开放**: 开放平台API供第三方使用

### 生态建设
- **开发者生态**: 第三方开发者工具
- **企业服务**: B2B数据服务
- **教育项目**: 影响力营销培训
- **投资孵化**: 投资相关创业项目

---

**项目负责人**: [产品经理]
**技术负责人**: [开发团队]
**预计启动时间**: [具体日期]
**项目预算**: [预算范围]

---

*本需求文档将根据项目进展和用户反馈持续更新优化* 