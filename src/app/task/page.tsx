'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Calendar, Check, Gift, Users, MessageCircle, Star, Trophy, Zap, Clock, CheckCircle, XCircle, Twitter, Send, Target, Award, Activity, TrendingUp, Coins, User, Bot, Sparkles, ExternalLink, RefreshCw, AlertTriangle, Info, Plus, Rocket } from 'lucide-react';
import toast from 'react-hot-toast';
import { BottomNavigation } from '../../components/BottomNavigation';
import { UserDropdown } from '../../components/UserDropdown';
import { TwitterSignInButton } from '../../components/TwitterSignInButton';
import { TwitterFooterLink } from '../../components/TwitterFooterLink';

interface Task {
  id: string;
  type: string;
  title: string;
  description: string;
  reward: number;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'daily' | 'social' | 'engagement' | 'special';
  requirements: {
    [key: string]: any;
  };
  isRepeatable: boolean;
  cooldownHours: number;
}

interface UserTaskRecord {
  id: string;
  taskId: string;
  userId: string;
  status: 'pending' | 'completed' | 'claimed';
  completedAt: string | null;
  claimedAt: string | null;
  reward: number;
  task: Task;
}

interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  totalRewards: number;
  streakDays: number;
  todayTasks: number;
  todayCompleted: number;
}

export default function TaskPage() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userTasks, setUserTasks] = useState<UserTaskRecord[]>([]);
  const [taskStats, setTaskStats] = useState<TaskStats>({
    totalTasks: 0,
    completedTasks: 0,
    totalRewards: 0,
    streakDays: 0,
    todayTasks: 0,
    todayCompleted: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'history' | 'stats'>('tasks');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'daily' | 'social' | 'engagement' | 'special'>('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  // 检查用户是否已登录
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      redirect('/');
    }
  }, [session, status]);

  // 页面加载时获取任务数据
  useEffect(() => {
    if (session?.user) {
      fetchTasks();
      fetchUserTasks();
      fetchTaskStats();
    }
  }, [session]);

  // 计算距离下次签到重置的时间
  const calculateTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 实时更新倒计时
  useEffect(() => {
    const updateTimer = () => {
      setTimeUntilReset(calculateTimeUntilReset());
    };

    updateTimer(); // 立即更新一次
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/task/available');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchUserTasks = async () => {
    try {
      const response = await fetch('/api/task/user-tasks');
      if (response.ok) {
        const data = await response.json();
        setUserTasks(data);
      }
    } catch (error) {
      console.error('Error fetching user tasks:', error);
    }
  };

  const fetchTaskStats = async () => {
    try {
      const response = await fetch('/api/task/stats');
      if (response.ok) {
        const data = await response.json();
        setTaskStats(data);
      }
    } catch (error) {
      console.error('Error fetching task stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskAction = async (taskId: string, action: 'complete' | 'claim') => {
    setIsProcessing(taskId);
    try {
      const response = await fetch('/api/task/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId, action }),
      });

      const data = await response.json();

      if (response.ok) {
        if (action === 'complete') {
          // 特殊处理签到任务的成功消息
          if (taskId === 'daily-checkin' && data.taskResult?.multiplier && data.taskResult?.aiScore) {
            toast.success(`🎲 Lucky! ${data.taskResult.multiplier}x multiplier × ${data.taskResult.aiScore} AI Score = ${data.taskResult.reward} $XOGS!`, {
              style: {
                borderRadius: '12px',
                background: '#10b981',
                color: '#fff',
              },
              duration: 5000,
            });
          } else if (taskId === 'daily-checkin' && data.reward) {
            // 每日签到直接显示奖励金额
            toast.success(`🎉 Daily check-in completed! Earned ${data.reward} $XOGS tokens!`, {
              style: {
                borderRadius: '12px',
                background: '#10b981',
                color: '#fff',
              },
              duration: 4000,
            });
          } else {
            toast.success('🎉 Task completed successfully!', {
              style: {
                borderRadius: '12px',
                background: '#10b981',
                color: '#fff',
              },
            });
          }
        } else {
          toast.success(`💰 Earned ${data.reward} $XOGS tokens!`, {
            style: {
              borderRadius: '12px',
              background: '#f59e0b',
              color: '#fff',
            },
          });
        }

        // 刷新数据
        fetchUserTasks();
        fetchTaskStats();
      } else {
        toast.error(data.error || `Failed to ${action} task`);
      }
    } catch (error) {
      console.error(`Error ${action}ing task:`, error);
      toast.error(`Network error while ${action}ing task`);
    } finally {
      setIsProcessing(null);
    }
  };

  const getTaskIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      calendar: Calendar,
      twitter: Twitter,
      users: Users,
      message: MessageCircle,
      star: Star,
      gift: Gift,
      trophy: Trophy,
      zap: Zap,
      target: Target,
      bot: Bot,
      send: Send
    };
    const IconComponent = iconMap[iconName] || Star;
    return <IconComponent className="h-6 w-6" />;
  };

  const getTaskStatus = (task: Task, userTask?: UserTaskRecord) => {
    if (!userTask) return 'available';

    // 对于可重复任务，需要检查冷却时间
    if (task.isRepeatable && userTask.status === 'claimed' && userTask.claimedAt) {
      const claimedDate = new Date(userTask.claimedAt);
      const now = new Date();
      const cooldownMs = task.cooldownHours * 60 * 60 * 1000;
      const timePassed = now.getTime() - claimedDate.getTime();

      // 如果已经过了冷却时间，任务重新变为可用
      if (timePassed >= cooldownMs) {
        return 'available';
      }
    }

    return userTask.status;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'from-green-500 to-emerald-500';
      case 'medium':
        return 'from-blue-500 to-cyan-500';
      case 'hard':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryColor = (category: string) => {
    // Since we only have 'daily' category now
    return 'from-orange-500 to-red-500';
  };

  const filteredTasks = tasks.filter(task =>
    selectedCategory === 'all' || task.category === selectedCategory
  );

  // 检查今天是否已经签到 - 使用UTC日期判断，与后端逻辑保持一致
  const todayCheckedIn = userTasks.some(ut => {
    if (ut.taskId !== 'daily-checkin' || ut.status !== 'claimed' || !ut.claimedAt) {
      return false;
    }

    // 获取UTC日期进行比较，与后端保持一致
    const claimedDate = new Date(ut.claimedAt);
    const todayUTC = new Date();

    // 转换为UTC日期字符串进行比较
    const claimedDateUTC = claimedDate.toISOString().split('T')[0];
    const todayDateUTC = todayUTC.toISOString().split('T')[0];

    return claimedDateUTC === todayDateUTC;
  });

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 relative mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-spin opacity-20"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse flex items-center justify-center shadow-2xl">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xl font-bold text-gray-800">Loading Tasks</p>
            <p className="text-gray-600">Task Center</p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 apple-fade-in pb-32">
      {/* Enhanced top navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 shadow-lg">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TASKS</span>
                <p className="text-xs text-gray-500 font-medium">Task Center</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {session?.user ? (
                <UserDropdown />
              ) : (
                <TwitterSignInButton className="px-4 py-2 text-sm" />
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-6 py-8 space-y-8">
        {/* Enhanced Hero Section */}
        <div className="text-center apple-slide-up">
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 flex items-center justify-center apple-float shadow-2xl">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
              <Gift className="w-4 h-4 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Task Center
          </h1>
          <p className="text-gray-600 leading-relaxed text-lg">
            Complete tasks and earn <span className="font-semibold text-blue-600">$XOGS rewards</span>
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 apple-scale-in">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-200/50 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">{taskStats.streakDays}</div>
            </div>
            <div className="text-sm text-blue-800 font-medium">Daily Streak</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200/50 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Coins className="h-5 w-5 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{taskStats.totalRewards}</div>
            </div>
            <div className="text-sm text-green-800 font-medium">Total Earned</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200/50 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">{taskStats.completedTasks}</div>
            </div>
            <div className="text-sm text-purple-800 font-medium">Completed</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-200/50 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">
                {taskStats.todayTasks > 0 ? Math.round((taskStats.todayCompleted / taskStats.todayTasks) * 100) : 0}%
              </div>
            </div>
            <div className="text-sm text-orange-800 font-medium">Today's Progress</div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/50 p-1">
          <div className="flex rounded-xl bg-gray-50/50">
            {[
              { key: 'tasks', label: 'Tasks', icon: Trophy },
              { key: 'history', label: 'History', icon: Clock },
              { key: 'stats', label: 'Stats', icon: Award },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${activeTab === tab.key
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-white/60'
                    }`}
                >
                  <IconComponent className={`w-4 h-4 mr-2 ${activeTab === tab.key ? 'animate-pulse' : ''}`} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Enhanced Category Filter - 暂时隐藏 */}
            {false && (
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100/50 p-4">
                <div className="flex gap-2 justify-center flex-wrap">
                  {[
                    { key: 'all', label: 'All Tasks', icon: '🌟' },
                    { key: 'daily', label: 'Daily Check-in', icon: '📅' },
                    { key: 'social', label: 'Social Tasks', icon: '🐦' },
                    { key: 'engagement', label: 'Engagement', icon: '💬' },
                    { key: 'special', label: 'Special Events', icon: '🎉' },
                  ].map((category) => (
                    <button
                      key={category.key}
                      onClick={() => setSelectedCategory(category.key as any)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${selectedCategory === category.key
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      <span>{category.icon}</span>
                      <span className="text-sm">{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 任务分类说明 */}
            {selectedCategory === 'daily' || selectedCategory === 'all' ? (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl shadow-lg border border-blue-200/50 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg flex-shrink-0">
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Daily Check-in Rules
                    </h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span><strong>Reset Time:</strong> Daily at UTC 0:00 (8:00 AM Beijing Time)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span><strong>Reward Calculation:</strong> AI Score × Random Multiplier (1.00-3.00)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span><strong>Streak:</strong> Accumulate consecutive days, restart after interruption</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span><strong>Minimum Reward:</strong> Guaranteed at least 1 $XOGS token</span>
                      </div>
                    </div>

                    {/* Today's Status */}
                    <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${todayCheckedIn ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                          <span className="text-sm font-medium text-gray-800">Today's Status</span>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-sm font-medium ${todayCheckedIn
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                          }`}>
                          {todayCheckedIn ? '✅ Checked In' : '⏳ Not Checked'}
                        </div>
                      </div>
                    </div>

                    {/* Countdown Timer */}
                    <div className="mt-2 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm font-medium text-indigo-800">Time Until Reset</span>
                        </div>
                        <div className="bg-white px-3 py-1 rounded-lg shadow-sm">
                          <span className="text-lg font-bold text-indigo-700 font-mono">
                            {timeUntilReset}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* 社交任务说明 */}
            {(selectedCategory === 'social' || selectedCategory === 'all') &&
              session?.user?.platformId && [10000, 10001].includes(session.user.platformId) ? (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl shadow-lg border border-blue-200/50 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg flex-shrink-0">
                    <Twitter className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Social Tasks Guide
                    </h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span><strong>Follow Twitter:</strong> Follow @xogsfun for latest updates and news</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span><strong>Auto Verification:</strong> System will check your following status automatically</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span><strong>One-time Reward:</strong> Complete once and claim 50 $XOGS tokens</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span><strong>Requirements:</strong> Active Twitter account connection required</span>
                      </div>
                    </div>

                    {/* 重要提示 */}
                    <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200/50">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-orange-800">Important Notice</p>
                          <p className="text-xs text-orange-700 mt-1">
                            Make sure you have connected your Twitter account and follow @xogsfun before attempting verification.
                            The verification process may take a few seconds to check your following status.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Task List */}
            <div className="space-y-4">
              {filteredTasks.map((task) => {
                // 对于可重复任务，取最新的记录
                const userTask = task.isRepeatable
                  ? userTasks.filter(ut => ut.taskId === task.id).sort((a, b) =>
                    new Date(b.completedAt || b.claimedAt || '').getTime() -
                    new Date(a.completedAt || a.claimedAt || '').getTime()
                  )[0]
                  : userTasks.find(ut => ut.taskId === task.id);

                // 对于签到任务，使用特殊的状态判断逻辑，并找到今天的任务记录
                let status;
                let todayUserTask = userTask;

                if (task.id === 'daily-checkin') {
                  status = todayCheckedIn ? 'claimed' : 'available';
                  // 如果今天已签到，找到今天的任务记录用于显示奖励
                  if (todayCheckedIn) {
                    todayUserTask = userTasks.find(ut => {
                      if (ut.taskId !== 'daily-checkin' || ut.status !== 'claimed' || !ut.claimedAt) {
                        return false;
                      }
                      const claimedDate = new Date(ut.claimedAt);
                      const todayUTC = new Date();
                      const claimedDateUTC = claimedDate.toISOString().split('T')[0];
                      const todayDateUTC = todayUTC.toISOString().split('T')[0];
                      return claimedDateUTC === todayDateUTC;
                    }) || userTask;
                  }
                } else {
                  status = getTaskStatus(task, userTask);
                }

                return (
                  <div key={task.id} className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100/50 p-6 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${getDifficultyColor(task.difficulty)} flex items-center justify-center shadow-lg`}>
                          <div className="text-white">
                            {getTaskIcon(task.icon)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getCategoryColor(task.category)}`}>
                              {task.category}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">{task.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* 奖励信息 */}
                      <div className="flex items-center space-x-2">
                        <Coins className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-gray-700">Reward:</span>
                        <span className="text-lg font-bold text-yellow-600">
                          {task.id === 'daily-checkin' ? '0.2x-1x × AI Score' : `${task.reward} $XOGS`}
                        </span>
                      </div>

                      {/* 任务标签 */}
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            task.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          {task.difficulty}
                        </span>
                        {task.isRepeatable && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Repeatable
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 任务操作按钮 */}
                    <div className="flex items-center justify-end gap-2 mt-4">
                      {/* 关注推特任务的特殊按钮 */}
                      {task.id === 'follow-twitter' && status === 'available' && (
                        <button
                          onClick={() => window.open('https://x.com/xogsfun', '_blank')}
                          className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span className="text-sm">Visit @xogsfun</span>
                        </button>
                      )}

                      {status === 'available' && (
                        <button
                          onClick={() => handleTaskAction(task.id, 'complete')}
                          disabled={isProcessing === task.id}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {isProcessing === task.id ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : task.id === 'follow-twitter' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Zap className="h-4 w-4" />
                          )}
                          <span className="text-sm">
                            {task.id === 'follow-twitter' ? 'Verify Follow' : 'Start'}
                          </span>
                        </button>
                      )}

                      {status === 'completed' && (
                        <button
                          onClick={() => handleTaskAction(task.id, 'claim')}
                          disabled={isProcessing === task.id}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 animate-pulse"
                        >
                          {isProcessing === task.id ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            <Gift className="h-4 w-4" />
                          )}
                          <span className="text-sm">Claim</span>
                        </button>
                      )}

                      {status === 'claimed' && (
                        <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-4 py-2 rounded-xl border border-green-200">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Claimed</span>
                          <div className="flex items-center gap-1 text-green-600">
                            <Coins className="h-3 w-3" />
                            <span className="text-xs font-bold">+{(task.id === 'daily-checkin' ? todayUserTask?.reward : userTask?.reward) || 0}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* More Tasks Coming Soon */}
              <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 rounded-3xl shadow-lg border border-purple-200/50 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">More Tasks Coming Soon</h3>
                        <Rocket className="w-5 h-5 text-purple-600 animate-bounce" />
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        We're cooking up exciting new tasks and challenges for you!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Stay tuned for updates</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>

              {filteredTasks.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                    <Trophy className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-2 text-lg">No tasks available</p>
                  <p className="text-gray-400">Check back later for new tasks!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center mr-4 shadow-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Task History</h3>
                    <p className="text-sm text-gray-600">Your completed tasks</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    fetchUserTasks();
                    fetchTaskStats();
                  }}
                  className="p-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  title="Refresh history"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>

              {userTasks.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                    <Clock className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-2 text-lg">No completed tasks yet</p>
                  <p className="text-gray-400">Start completing tasks to see your history!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {userTasks.map((userTask) => (
                    <div key={userTask.id} className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-md">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${getDifficultyColor(userTask.task.difficulty)} flex items-center justify-center shadow-md`}>
                            <div className="text-white text-sm">
                              {getTaskIcon(userTask.task.icon)}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{userTask.task.title}</h4>
                            <p className="text-sm text-gray-600">{userTask.task.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-yellow-600 mb-1">
                            <Coins className="h-3 w-3" />
                            <span className="text-sm font-bold">+{userTask.reward}</span>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full font-medium ${userTask.status === 'claimed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                            }`}>
                            {userTask.status}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {userTask.completedAt && (
                          <span>Completed: {new Date(userTask.completedAt).toLocaleDateString()}</span>
                        )}
                        {userTask.claimedAt && (
                          <span className="ml-4">Claimed: {new Date(userTask.claimedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100/50 p-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-4 shadow-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Task Statistics</h3>
                  <p className="text-sm text-gray-600">Your task performance</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Overall Progress */}
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border border-gray-200/50">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Overall Progress
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Completion Rate</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${taskStats.totalTasks > 0 ? (taskStats.completedTasks / taskStats.totalTasks) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="font-medium text-gray-900">
                          {taskStats.totalTasks > 0 ? Math.round((taskStats.completedTasks / taskStats.totalTasks) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Daily Streak</span>
                      <span className="font-medium text-gray-900">{taskStats.streakDays} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Rewards</span>
                      <span className="font-medium text-yellow-600">{taskStats.totalRewards} $XOGS</span>
                    </div>
                  </div>
                </div>

                {/* Today's Progress */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200/50">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-500" />
                    Today's Progress
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{taskStats.todayCompleted}</div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{taskStats.todayTasks}</div>
                      <div className="text-sm text-gray-600">Available</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Twitter Footer Link */}
        <TwitterFooterLink />
      </div>

      {/* Apple-style fixed bottom navigation */}
      <BottomNavigation />
    </div>
  );
} 