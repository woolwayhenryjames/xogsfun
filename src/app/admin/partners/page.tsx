'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Plus, Edit2, Trash2, Save, X, Check, AlertCircle, Users, Building2, ToggleLeft, ToggleRight, Eye, Sparkles, TrendingUp, Gift, Zap, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface Partner {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface UsageStats {
  totalGenerations: number;
  totalPublications: number;
  activeUsers: number;
  lastUsed: string | null;
}

export default function PartnersManagementPage() {
  const { data: session, status } = useSession();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: 0,
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partnerStats, setPartnerStats] = useState<Record<string, UsageStats>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [previewPartner, setPreviewPartner] = useState<Partner | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'order' | 'created' | 'activity'>('order');
  const [accessCheck, setAccessCheck] = useState<{
    isChecking: boolean;
    hasAccess: boolean;
    message: string;
  }>({
    isChecking: true,
    hasAccess: false,
    message: ''
  });

  // 检查管理权限
  useEffect(() => {
    const checkAccess = async () => {
      if (status === 'loading') return;
      
      if (!session?.user) {
        redirect('/auth/signin');
        return;
      }

      try {
        const response = await fetch('/api/user');
        const userData = await response.json();
        
        const hasAccess = userData.platformId === 10000 || userData.platformId === 10001;
        
        setAccessCheck({
          isChecking: false,
          hasAccess,
          message: hasAccess 
            ? 'Welcome to Partner Management' 
            : 'Access denied. Admin permission required.'
        });

        if (!hasAccess) {
          setTimeout(() => {
            redirect('/');
          }, 3000);
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setAccessCheck({
          isChecking: false,
          hasAccess: false,
          message: 'Error checking access permissions'
        });
      }
    };

    checkAccess();
  }, [session, status]);

  // 获取合作方列表
  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/partners');
      
      if (!response.ok) {
        throw new Error('Failed to fetch partners');
      }
      
      const data = await response.json();
      setPartners(data.partners || []);
      setError(null);
      
      // 获取合作伙伴使用统计
      await fetchPartnerStats(data.partners || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      setError('Failed to load partners');
    } finally {
      setLoading(false);
    }
  };

  // 获取合作伙伴使用统计
  const fetchPartnerStats = async (partnersList: Partner[]) => {
    try {
      const statsPromises = partnersList.map(async (partner) => {
        const response = await fetch(`/api/admin/partners/${partner.id}/stats`);
        if (response.ok) {
          const stats = await response.json();
          return { partnerId: partner.id, stats };
        }
        return { partnerId: partner.id, stats: null };
      });

      const results = await Promise.all(statsPromises);
      const statsMap: Record<string, UsageStats> = {};
      
      results.forEach(({ partnerId, stats }) => {
        if (stats) {
          statsMap[partnerId] = stats;
        }
      });
      
      setPartnerStats(statsMap);
    } catch (error) {
      console.error('Error fetching partner stats:', error);
    }
  };

  useEffect(() => {
    if (accessCheck.hasAccess && !accessCheck.isChecking) {
      fetchPartners();
    }
  }, [accessCheck.hasAccess, accessCheck.isChecking]);

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      displayOrder: 0,
      isActive: true
    });
    setEditingPartner(null);
    setShowAddForm(false);
  };

  // 开始编辑
  const startEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      description: partner.description,
      displayOrder: partner.displayOrder,
      isActive: partner.isActive
    });
    setShowAddForm(false);
  };

  // 提交表单（添加或更新）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Name and description are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingPartner 
        ? `/api/admin/partners/${editingPartner.id}`
        : '/api/admin/partners';
      
      const method = editingPartner ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save partner');
      }

      toast.success(data.message);
      resetForm();
      fetchPartners();
    } catch (error) {
      console.error('Error saving partner:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save partner');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除合作方
  const handleDelete = async (partnerId: string, partnerName: string) => {
    if (!confirm(`Are you sure you want to delete "${partnerName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/partners/${partnerId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete partner');
      }

      toast.success(data.message);
      fetchPartners();
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete partner');
    }
  };

  // 切换激活状态
  const toggleActive = async (partner: Partner) => {
    try {
      const response = await fetch(`/api/admin/partners/${partner.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...partner,
          isActive: !partner.isActive
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update partner');
      }

      toast.success(`Partner ${!partner.isActive ? 'activated' : 'deactivated'}`);
      fetchPartners();
    } catch (error) {
      console.error('Error toggling partner status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update partner');
    }
  };

  // 排序合作伙伴
  const sortedPartners = [...partners].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'order':
        return a.displayOrder - b.displayOrder;
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'activity':
        const statsA = partnerStats[a.id];
        const statsB = partnerStats[b.id];
        const activityA = statsA ? statsA.totalGenerations + statsA.totalPublications : 0;
        const activityB = statsB ? statsB.totalGenerations + statsB.totalPublications : 0;
        return activityB - activityA;
      default:
        return 0;
    }
  });

  // 预览合作伙伴在InfoFi中的显示效果
  const previewInInfoFi = (partner: Partner) => {
    setPreviewPartner(partner);
    setShowPreview(true);
  };

  // 获取合作伙伴图标
  const getPartnerIcon = (partnerName: string) => {
    switch (partnerName.toUpperCase()) {
      case 'UXUY':
        return <Zap className="h-5 w-5 text-blue-500" />;
      case 'XOGS':
        return <Sparkles className="h-5 w-5 text-purple-500" />;
      default:
        return <Gift className="h-5 w-5 text-gray-500" />;
    }
  };

  // 检查权限中
  if (accessCheck.isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // 无权限访问
  if (!accessCheck.hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{accessCheck.message}</p>
          <p className="text-sm text-gray-500">Redirecting to homepage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-sm p-6 mb-6 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  InfoFi Partners
                </h1>
                <p className="text-gray-600 text-lg">管理InfoFi AI推文工作室的合作伙伴</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                <span>新增合作伙伴</span>
              </button>
            </div>
          </div>
          
          {/* 统计概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-white/50">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">总合作伙伴</p>
                  <p className="text-2xl font-bold text-gray-900">{partners.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-white/50">
              <div className="flex items-center space-x-3">
                <Check className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">活跃合作伙伴</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {partners.filter(p => p.isActive).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-white/50">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">总生成次数</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.values(partnerStats).reduce((sum, stats) => sum + stats.totalGenerations, 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-white/50">
              <div className="flex items-center space-x-3">
                <Sparkles className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">总发布次数</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.values(partnerStats).reduce((sum, stats) => sum + stats.totalPublications, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 添加/编辑表单 */}
        {(showAddForm || editingPartner) && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                {getPartnerIcon(formData.name)}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingPartner ? '编辑合作伙伴' : '新增合作伙伴'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {editingPartner ? '修改现有合作伙伴信息' : '添加新的InfoFi合作伙伴'}
                  </p>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    合作伙伴名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="如: UXUY, XOGS, etc."
                    required
                  />
                  <p className="text-xs text-gray-500">
                    合作伙伴的显示名称，将出现在AI生成的推文中
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    显示顺序
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0"
                    min="0"
                  />
                  <p className="text-xs text-gray-500">
                    数字越小越靠前，用于控制在下拉菜单中的显示顺序
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  合作伙伴描述 *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="描述合作伙伴的主要特点和价值主张，这将用于AI生成相关内容..."
                  rows={4}
                  required
                />
                <p className="text-xs text-gray-500">
                  详细描述将帮助AI生成更准确和相关的推文内容
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  激活状态
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      formData.isActive
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {formData.isActive ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>已激活</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4" />
                        <span>未激活</span>
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500">
                    只有激活的合作伙伴才会在InfoFi中显示
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  * 必填字段
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-8 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isSubmitting ? '保存中...' : '保存'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* 合作方列表 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  合作伙伴管理 ({partners.length})
                </h2>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="order">按显示顺序</option>
                    <option value="name">按名称</option>
                    <option value="created">按创建时间</option>
                    <option value="activity">按活跃度</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading partners...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchPartners}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : partners.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No partners found</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                Add your first partner
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      合作伙伴
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      使用统计
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      顺序
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {sortedPartners.map((partner) => {
                    const stats = partnerStats[partner.id];
                    return (
                      <tr key={partner.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-start space-x-3">
                            {getPartnerIcon(partner.name)}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                                <span>{partner.name}</span>
                                {partner.name.toUpperCase() === 'UXUY' && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    DeFi
                                  </span>
                                )}
                                {partner.name.toUpperCase() === 'XOGS' && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    Platform
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-2">
                                {partner.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleActive(partner)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                              partner.isActive
                                ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                            }`}
                          >
                            {partner.isActive ? (
                              <>
                                <ToggleRight className="h-4 w-4" />
                                <span>已激活</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="h-4 w-4" />
                                <span>未激活</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          {stats ? (
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-xs text-gray-600">
                                <TrendingUp className="h-3 w-3 text-blue-500" />
                                <span>生成: {stats.totalGenerations}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-600">
                                <Sparkles className="h-3 w-3 text-purple-500" />
                                <span>发布: {stats.totalPublications}</span>
                              </div>
                              {stats.activeUsers > 0 && (
                                <div className="flex items-center space-x-2 text-xs text-gray-600">
                                  <Users className="h-3 w-3 text-green-500" />
                                  <span>用户: {stats.activeUsers}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">暂无数据</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                            {partner.displayOrder}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(partner.createdAt).toLocaleDateString('zh-CN')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => previewInInfoFi(partner)}
                              className="text-purple-600 hover:text-purple-700 p-2 hover:bg-purple-50 rounded-lg transition-colors"
                              title="预览"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => startEdit(partner)}
                              className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="编辑"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(partner.id, partner.name)}
                              className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="删除"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 预览模态框 */}
        {showPreview && previewPartner && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getPartnerIcon(previewPartner.name)}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        InfoFi 预览
                      </h3>
                      <p className="text-sm text-gray-600">
                        {previewPartner.name} 在InfoFi中的显示效果
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* 模拟InfoFi中的合作伙伴选择器 */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    合作伙伴选择 (模拟)
                  </label>
                  <div className="relative">
                    <select 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      disabled
                    >
                      <option>{previewPartner.name}</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      {getPartnerIcon(previewPartner.name)}
                    </div>
                  </div>
                </div>

                {/* 模拟生成的内容预览 */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    AI生成内容预览 (示例)
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="text-sm text-gray-700 leading-relaxed">
                      {previewPartner.name === 'UXUY' ? (
                        <>
                          "刚发现 {previewPartner.name} 的零Gas费交易！终于不用再为网络费心疼钱包了 💸➡️💰 
                          {previewPartner.description.substring(0, 50)}... #UXUY #DeFi"
                        </>
                      ) : previewPartner.name === 'XOGS' ? (
                        <>
                          "你的Twitter影响力值多少钱？{previewPartner.name} 用AI告诉你答案！ 
                          Top 1000用户专享，每月一次变现机会 🚀 #{previewPartner.name} #CryptoTwitter"
                        </>
                      ) : (
                        <>
                          "发现了 {previewPartner.name} 的独特价值！{previewPartner.description.substring(0, 60)}... 
                          这就是我们需要的创新 🔥 #{previewPartner.name}"
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 合作伙伴信息展示 */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    合作伙伴信息
                  </label>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      {getPartnerIcon(previewPartner.name)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{previewPartner.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{previewPartner.description}</p>
                        <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                          <span>显示顺序: {previewPartner.displayOrder}</span>
                          <span className={`px-2 py-1 rounded-full ${
                            previewPartner.isActive 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {previewPartner.isActive ? '已激活' : '未激活'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 使用统计 */}
                {partnerStats[previewPartner.id] && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      使用统计
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {partnerStats[previewPartner.id].totalGenerations}
                        </div>
                        <div className="text-xs text-blue-700">生成次数</div>
                      </div>
                      <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-purple-600">
                          {partnerStats[previewPartner.id].totalPublications}
                        </div>
                        <div className="text-xs text-purple-700">发布次数</div>
                      </div>
                      <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-green-600">
                          {partnerStats[previewPartner.id].activeUsers}
                        </div>
                        <div className="text-xs text-green-700">活跃用户</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    关闭
                  </button>
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      startEdit(previewPartner);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    编辑合作伙伴
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 