'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import {
  Coins,
  TrendingUp,
  Users,
  Trophy,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  RefreshCw,
  Clock,
  CheckCircle,
  Star,
  Gift,
  ChevronDown,
  ChevronUp,
  Activity,
  DollarSign,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { BottomNavigation } from '../../components/BottomNavigation';
import { UserDropdown } from '../../components/UserDropdown';
import { TwitterSignInButton } from '../../components/TwitterSignInButton';
import { XLogoMinimal } from '../../components/XLogo';

interface Transaction {
  id: string;
  type: 'invite_reward' | 'base_score' | 'task_reward' | 'system_adjustment';
  amount: number;
  description: string;
  relatedUser?: string;
  createdAt: string;
  status: 'completed' | 'pending';
}

interface TransactionData {
  currentBalance: number;
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics: {
    totalEarned: number;
    inviteEarnings: number;
    taskEarnings: number;
    baseEarnings: number;
    transactionCount: number;
  };
}

export default function XogsPage() {
  const { data: session, status } = useSession();
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<string>('all');
  const [showStatistics, setShowStatistics] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      redirect('/');
    }
  }, [session, status]);

  // Fetch transaction data
  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/xogs/transactions?page=${page}&limit=20`);

      if (response.ok) {
        const data = await response.json();
        setTransactionData(data.data);
      } else {
        toast.error('Failed to fetch transaction records');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage]);

  // Get transaction type icon
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'invite_reward':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'task_reward':
        return <Trophy className="w-5 h-5 text-green-600" />;
      case 'base_score':
        return <Star className="w-5 h-5 text-yellow-600" />;
      default:
        return <Coins className="w-5 h-5 text-purple-600" />;
    }
  };

  // Get transaction type color
  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'invite_reward':
        return 'bg-blue-50 border-blue-200';
      case 'task_reward':
        return 'bg-green-50 border-green-200';
      case 'base_score':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-purple-50 border-purple-200';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter transactions
  const filteredTransactions = transactionData?.transactions.filter(transaction => {
    if (filterType === 'all') return true;
    return transaction.type === filterType;
  }) || [];

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 relative mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 animate-spin opacity-20"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 animate-pulse flex items-center justify-center shadow-2xl">
              <Coins className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xl font-bold text-gray-800">Loading $XOGS Records</p>
            <p className="text-gray-600">Loading financial records...</p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 apple-fade-in pb-32">
      {/* Enhanced top navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 shadow-lg">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-600 via-orange-600 to-red-600 flex items-center justify-center shadow-lg">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">$XOGS</span>
                <p className="text-xs text-gray-500 font-medium">Financial Records</p>
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
        {/* Current balance card */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl shadow-xl border border-orange-100 p-6 apple-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-900 mb-1">
                  {transactionData?.currentBalance?.toLocaleString() || 0}
                </div>
                <div className="text-sm font-medium text-orange-600">Current $XOGS Balance</div>
              </div>
            </div>
            <button
              onClick={() => fetchTransactions(currentPage)}
              className="p-3 rounded-xl bg-orange-100 text-orange-600 hover:bg-orange-200 transition-all duration-200 shadow-sm hover:shadow-md"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          <div className="text-xs text-orange-700/70">
            Earn more $XOGS tokens by inviting friends and completing tasks
          </div>
        </div>

        {/* Statistics card */}
        {transactionData?.statistics && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100/50 p-6">
            <button
              onClick={() => setShowStatistics(!showStatistics)}
              className="w-full flex items-center justify-between mb-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Earnings Statistics</h3>
                  <p className="text-sm text-gray-600">View detailed earnings analysis</p>
                </div>
              </div>
              <div className="transition-transform duration-200" style={{ transform: showStatistics ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </div>
            </button>

            {showStatistics && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div className="text-2xl font-bold text-green-600">
                      {transactionData.statistics.totalEarned.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-green-800 font-medium">Total Earnings</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div className="text-2xl font-bold text-blue-600">
                      {transactionData.statistics.inviteEarnings.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-blue-800 font-medium">Invite Earnings</div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-4 border border-yellow-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    <div className="text-2xl font-bold text-yellow-600">
                      {transactionData.statistics.baseEarnings.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-yellow-800 font-medium">Base Rewards</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <Trophy className="h-5 w-5 text-purple-600" />
                    <div className="text-2xl font-bold text-purple-600">
                      {transactionData.statistics.taskEarnings.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-purple-800 font-medium">Task Rewards</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filter */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100/50 p-4">
          <div className="flex items-center gap-3 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter Transaction Type</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'all', label: 'All', icon: DollarSign },
              { key: 'invite_reward', label: 'Invite Rewards', icon: Users },
              { key: 'base_score', label: 'Base Rewards', icon: Star },
              { key: 'task_reward', label: 'Task Rewards', icon: Trophy },
            ].map((filter) => {
              const IconComponent = filter.icon;
              return (
                <button
                  key={filter.key}
                  onClick={() => setFilterType(filter.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${filterType === filter.key
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Transaction history list */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Transaction History</h3>
                <p className="text-sm text-gray-600">
                  Total {transactionData?.pagination.total || 0} records
                </p>
              </div>
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                <Coins className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium mb-2 text-lg">No transaction records</p>
              <p className="text-gray-400">Start inviting friends or completing tasks to earn $XOGS rewards!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`rounded-2xl p-5 border transition-all duration-200 hover:shadow-md ${getTransactionColor(transaction.type)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-gray-900 mb-1">
                          {transaction.description}
                        </div>
                        {transaction.relatedUser && (
                          <div className="text-xs text-gray-600">
                            Related user: {transaction.relatedUser}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                        <ArrowUpRight className="w-4 h-4" />
                        +{transaction.amount.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(transaction.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {transactionData && transactionData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all duration-200"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                {currentPage} / {transactionData.pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(transactionData.pagination.totalPages, prev + 1))}
                disabled={currentPage === transactionData.pagination.totalPages}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all duration-200"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Apple-style fixed bottom navigation */}
      <BottomNavigation />
    </div>
  );
} 