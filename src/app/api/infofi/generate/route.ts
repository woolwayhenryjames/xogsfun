import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sponsor, template, customPrompt } = await request.json();
    
    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor is required' }, { status: 400 });
    }

    // 支持多选模板或自定义提示词
    const templates = Array.isArray(template) ? template : (template ? [template] : []);

    // 处理单选模板或自定义提示词
    const selectedTemplate = template || null;

    // 检查每日生成次数限制（UTC时间）
    const today = new Date();
    const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1));

    // 统计今日生成次数（所有状态的推文，包括未发布的）
    const todayGenerations = await prisma.tweet.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });

    // 每日生成限制3次
    const DAILY_GENERATION_LIMIT = 3;
    if (todayGenerations >= DAILY_GENERATION_LIMIT) {
      const nextMidnight = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1));
      const hoursUntilReset = Math.ceil((nextMidnight.getTime() - today.getTime()) / (1000 * 60 * 60));
      
      return NextResponse.json({ 
        error: `Daily generation limit reached (${DAILY_GENERATION_LIMIT}/day). You can generate again in ${hoursUntilReset} hours.`,
        generationLimitReached: true,
        hoursUntilReset,
        usedGenerations: todayGenerations,
        maxGenerations: DAILY_GENERATION_LIMIT
      }, { status: 429 });
    }

    // 获取XAI API密钥
    const xaiApiKey = process.env.XAI_API_KEY;
    if (!xaiApiKey) {
      return NextResponse.json({ error: 'XAI API key not configured' }, { status: 500 });
    }

    // 根据赞助商和模板生成不同的prompt
    const generatePrompt = async (sponsor: string, template: string | null, customPrompt?: string) => {
      // 获取用户信息，添加个性化因素
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          username: true,
          name: true,
          description: true,
          followersCount: true,
          aiScore: true
        }
      });
      
      // 获取合作伙伴信息，特别是 description
      const partnerInfo = await prisma.partner.findFirst({
        where: { 
          name: sponsor,
          isActive: true
        },
        select: {
          description: true
        }
      });
      
      const partnerDescription = partnerInfo?.description || 
        (sponsor === 'UXUY' ? 'Gas-free trading platform' : 
         sponsor === 'XOGS' ? 'AI-powered Twitter influence scoring platform' : 
         `${sponsor} platform`);
      
      // 生成随机因子，确保每次生成都不同
      const randomFactor = Math.random().toString(36).substring(2, 8);
      const timestamp = new Date().toISOString();
      
      // 如果有自定义提示词，优先使用
      if (customPrompt) {
        return `Generate a unique Twitter post about ${sponsor} based on the following custom instructions:
        
        ${customPrompt}
        
        CRITICAL REQUIREMENTS:
        - MUST be under 260 characters (strict limit)
        - Include relevant hashtags
        - Make it engaging and authentic
        - Don't make it sound like an obvious advertisement
        - Create content that matches the style of a user with ${user?.followersCount || 'some'} followers
        - Consider the user's profile: ${user?.description || 'crypto enthusiast'}
        
        Sponsor context:
        - ${sponsor}: ${partnerDescription}
        
        Important: Generate a completely unique post under 260 characters. Use this random seed for variation: ${randomFactor}`;
      }

      const basePrompts = {
        UXUY: {
          promotional: `Create a compelling tweet showcasing UXUY's value:

**Context**: ${partnerDescription}

**Key Benefits to Highlight:**
- Zero gas fees = more profits for traders
- Beginner-friendly with pro features
- Lightning-fast transactions
- Save hundreds on fees monthly

**Viral Elements to Include:**
- Personal discovery story ("Just found..." or "Finally...")
- Pain point solution (gas fees problem)
- Social proof hint ("traders are switching to...")
- Clear value proposition

**Tone**: Authentic excitement, like a real user sharing a great find
**Length**: Under 240 characters
**Goal**: Make readers want to try UXUY themselves

Example frameworks:
- "Been trading for X years, never seen..."
- "Gas fees killing your profits? Found the solution..."
- "Why are more traders switching to..."`,
          
          educational: `Create an educational thread-starter about gas-free trading:

**Educational Goal**: Explain gas fees problem and UXUY's solution

**Structure**:
1. Start with relatable problem: "Ever wonder why your $10 trade costs $15 in fees?"
2. Brief explanation: Gas fees are network charges for processing
3. Solution reveal: How UXUY eliminates this completely
4. Impact: "More money in your pocket, not the network"

**Style Guidelines**:
- Use analogies (gas fees = highway tolls)
- Include real numbers when possible
- End with actionable insight
- Sound like you're teaching a friend

**Engagement**: Include a question to spark discussion
**Length**: 220-240 characters for maximum impact`,
          
          community: `Generate a community-focused Twitter post about UXUY.
          Include:
          - Community benefits
          - User testimonials style
          - Invite others to join
          - Social proof elements
          
          Style: Community-driven, social
          CRITICAL: Must be under 260 characters, include hashtags, engaging`,
          
          news: `Generate a news-style Twitter post about UXUY developments.
          Include:
          - Recent updates or features
          - Industry trends
          - Innovation highlights
          - Future potential
          
          Style: News-worthy, professional
          CRITICAL: Must be under 260 characters, include hashtags, credible`,
          
          question: `Generate an interactive Twitter post about UXUY.
          Include:
          - Questions about gas fees
          - Trading experience polls
          - User preference questions
          
          Style: Interactive, question-based
          CRITICAL: Must be under 260 characters, include hashtags, encourage replies`
        },
        
        XOGS: {
          promotional: `Create a viral tweet about XOGS that crypto Twitter will love:

**Context**: ${partnerDescription}

**Viral Hooks to Use:**
- "Your Twitter is worth more than you think..."
- "Finally, a way to monetize your crypto takes..."
- "Crypto influencers are earning from their tweets..."
- "Turn your Twitter influence into actual $XOGS..."

**Key Points**:
- AI analyzes your crypto Twitter value
- Top 1000 users get exclusive access
- Earn tokens based on influence score
- Join the crypto elite community

**Psychology**: FOMO + exclusivity + immediate value
**Style**: Confident, aspirational, slightly exclusive
**Length**: 230-250 characters for maximum viral potential

Make it sound like insider knowledge being shared!`,
          
          educational: `Generate an educational Twitter post about AI Twitter scoring.
          Explain:
          - How AI evaluates Twitter accounts
          - Factors in influence measurement
          - Benefits of knowing your score
          - Crypto Twitter importance
          
          Style: Informative, insightful
          CRITICAL: Must be under 260 characters, include hashtags, educational`,
          
          community: `Generate a community Twitter post about XOGS.
          Include:
          - Community of crypto influencers
          - Success stories
          - Encourage participation
          - Network effects
          
          Style: Community-building, inclusive
          CRITICAL: Must be under 260 characters, include hashtags, welcoming`,
          
          news: `Generate a news-style Twitter post about XOGS platform.
          Include:
          - Platform milestones
          - User growth statistics
          - Industry recognition
          - Future developments
          
          Style: Professional, newsworthy
          CRITICAL: Must be under 260 characters, include hashtags, credible`,
          
          question: `Generate an interactive Twitter post about XOGS.
          Include:
          - Questions about crypto Twitter influence
          - Poll ideas about AI scoring
          - Discussion starters
          
          Style: Interactive, question-based
          CRITICAL: Must be under 260 characters, include hashtags, encourage engagement`
        }
    };

      // 为任何合作伙伴创建动态提示词
      let sponsorPrompts = basePrompts[sponsor as keyof typeof basePrompts];
      
      // 如果没有预定义的提示词，为该合作伙伴创建通用提示词
      if (!sponsorPrompts) {
        sponsorPrompts = {
          promotional: `Generate a promotional Twitter post about ${sponsor}.
          Highlight:
          - ${partnerDescription}
          - Key benefits for users
          - Unique selling points
          
          Style: Enthusiastic, benefit-focused
          CRITICAL: Must be under 260 characters, include hashtags, no obvious ads`,
          
          educational: `Generate an educational Twitter post about ${sponsor}.
          Explain:
          - What is ${sponsor}
          - How ${sponsor} helps users
          - Benefits and advantages
          - Technical innovations
          
          Style: Informative, helpful
          CRITICAL: Must be under 260 characters, include hashtags, educational tone`,
          
          community: `Generate a community-focused Twitter post about ${sponsor}.
          Include:
          - Community benefits
          - User testimonials style
          - Invite others to join
          - Social proof elements
          
          Style: Community-driven, social
          CRITICAL: Must be under 260 characters, include hashtags, engaging`,
          
          news: `Generate a news-style Twitter post about ${sponsor} developments.
          Include:
          - Recent updates or features
          - Industry trends
          - Innovation highlights
          - Future potential
          
          Style: News-worthy, professional
          CRITICAL: Must be under 260 characters, include hashtags, credible`,
          
          question: `Generate an interactive Twitter post about ${sponsor}.
          Include:
          - Questions about ${sponsor}'s features
          - User experience polls
          - Discussion starters
          
          Style: Interactive, question-based
          CRITICAL: Must be under 260 characters, include hashtags, encourage replies`
        };
      }
      
      // 使用选择的模板或默认promotional
      const selectedTemplate = template || 'promotional';
      const basePrompt = sponsorPrompts[selectedTemplate as keyof typeof sponsorPrompts] || sponsorPrompts.promotional;
      
      // 添加用户个性化和随机因子
      return `${basePrompt}
      
      Sponsor Description: ${partnerDescription}
      
      Additional personalization:
      - User has ${user?.followersCount || 'some'} followers
      - User bio: ${user?.description || 'crypto enthusiast'}
      - User AI score: ${user?.aiScore || 'medium'}
      
      CRITICAL: Generate a completely unique post UNDER 260 CHARACTERS. Use this random seed for variation: ${randomFactor}
      Current timestamp: ${timestamp}`;
    };

    const prompt = await generatePrompt(sponsor, selectedTemplate, customPrompt);

    // 智能重试机制 - 最多尝试2次以确保质量
    let finalContent = '';
    let attempt = 0;
    const maxAttempts = 2;

    while (attempt < maxAttempts && !finalContent) {
      attempt++;

    // 调用XAI API
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${xaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-3',
        messages: [
          {
            role: 'system',
            content: `You are an elite social media strategist specializing in viral crypto Twitter content. Your expertise:

🎯 **Mission**: Create authentic, engaging tweets that drive genuine interaction
📱 **Style**: Natural conversational tone, avoid obvious marketing language  
🔥 **Engagement**: Use proven viral elements: questions, insights, storytelling
💎 **Crypto Focus**: Deep understanding of DeFi, trading, blockchain trends
🚫 **Avoid**: Generic phrases, excessive emojis, promotional language

**CRITICAL CONSTRAINTS:**
- Maximum 250 characters (strict limit)
- Include 1-2 relevant hashtags maximum
- Use emojis sparingly but effectively
- Each tweet must be unique and valuable
- Sound like a real crypto enthusiast, not a bot

**Quality Standards:**
- Provide genuine value or insight
- Encourage discussion/engagement  
- Reflect current crypto culture and trends
- Be conversational, not promotional`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.85,
        top_p: 0.9,
        frequency_penalty: 0.7,
        presence_penalty: 0.6
      }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`XAI API Error (attempt ${attempt}):`, errorText);
        
        // 检查是否是模型不存在的错误
        if (errorText.includes('does not exist') || errorText.includes('not found')) {
          return NextResponse.json({ 
            error: 'AI模型暂时不可用，请稍后再试或联系管理员',
            details: 'XAI API模型访问问题'
          }, { status: 503 });
        }
        
        if (attempt === maxAttempts) {
          return NextResponse.json({ 
            error: '多次尝试后仍无法生成内容，请稍后再试',
            details: `尝试了${maxAttempts}次`
          }, { status: 500 });
        }
        continue; // 重试
      }

      const data = await response.json();
      const generatedContent = data.choices?.[0]?.message?.content;

      if (!generatedContent) {
        if (attempt === maxAttempts) {
          return NextResponse.json({ error: 'No content generated after multiple attempts' }, { status: 500 });
        }
        continue; // 重试
      }

      // 内容质量检查
      const contentToCheck = generatedContent.trim();
      
      // 检查内容质量标准
      const qualityChecks = {
        hasContent: contentToCheck.length > 20,
        notTooLong: contentToCheck.length <= 280,
        hasRelevantKeywords: contentToCheck.toLowerCase().includes(sponsor.toLowerCase()) || 
                           /#[a-zA-Z]+/.test(contentToCheck),
        notGeneric: !/(tweet|post|content|generate)/i.test(contentToCheck.substring(0, 20))
      };

      const passedChecks = Object.values(qualityChecks).filter(Boolean).length;
      
      if (passedChecks >= 3) { // 至少通过3项质量检查
        // 智能内容优化和验证
        let processedContent = contentToCheck;
        
        // 移除多余的引号和格式
        processedContent = processedContent.replace(/^["']|["']$/g, '');
        processedContent = processedContent.replace(/^\s*Tweet:\s*/i, '');
        processedContent = processedContent.replace(/^\s*Content:\s*/i, '');
        
        // 如果超过250字符，智能截断
        if (processedContent.length > 250) {
          // 尝试在句子结束处截断
          const sentences = processedContent.split(/[.!?]/);
          let truncated = '';
          for (const sentence of sentences) {
            if ((truncated + sentence).length <= 247) {
              truncated += sentence + (sentence.includes('?') ? '?' : sentence.includes('!') ? '!' : '.');
            } else {
              break;
            }
          }
          
          // 如果截断后太短，使用简单截断
          if (truncated.length < 100) {
            processedContent = processedContent.substring(0, 247) + '...';
          } else {
            processedContent = truncated;
          }
        }
        
        // 确保至少有一个hashtag
        if (!/#\w+/.test(processedContent)) {
          const sponsorTag = sponsor === 'UXUY' ? '#UXUY' : sponsor === 'XOGS' ? '#XOGS' : '#Crypto';
          if ((processedContent + ' ' + sponsorTag).length <= 250) {
            processedContent += ' ' + sponsorTag;
          }
        }
        
        finalContent = processedContent;
        break; // 成功生成，退出重试循环
      } else {
        console.log(`Quality check failed (attempt ${attempt}): passed ${passedChecks}/4 checks`);
        if (attempt === maxAttempts) {
          // 如果最后一次尝试仍然不符合质量标准，使用降级处理
          finalContent = contentToCheck.substring(0, 240) + '... #' + sponsor;
          break;
        }
        // 继续重试
      }
    }

    // 创建推文记录（生成状态）
    await prisma.tweet.create({
      data: {
        userId: session.user.id,
        content: finalContent,
        sponsor,
        status: 'generated', // 新状态：仅生成，未发布
        aiPrompt: prompt.substring(0, 500), // 保存完整prompt用于记录
      }
    });

    return NextResponse.json({
      content: finalContent,
      sponsor,
      template: selectedTemplate,
      customPrompt,
      usedGenerations: todayGenerations + 1,
      maxGenerations: DAILY_GENERATION_LIMIT,
      remainingGenerations: DAILY_GENERATION_LIMIT - todayGenerations - 1,
      prompt: prompt.substring(0, 100) + '...' // 保存prompt的前100个字符用于记录
    });

  } catch (error) {
    console.error('Error generating tweet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 