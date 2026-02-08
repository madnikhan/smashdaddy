'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, Users, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import InstallPrompt from '@/components/InstallPrompt';

interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  totalDrivers: number;
  ordersByStatus: Record<string, number>;
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?range=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalytics(data.analytics);
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <InstallPrompt />
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="mb-4">
                ← Back to Admin
              </Button>
            </Link>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-text">Analytics & Reports</h1>
                <p className="text-text-secondary mt-2">System performance and insights</p>
              </div>
              <div className="flex gap-2">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="px-4 py-2 bg-tertiary border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="all">All time</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading analytics...</p>
            </div>
          ) : analytics ? (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Total Revenue</p>
                      <p className="text-3xl font-bold text-text">£{analytics.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-secondary/10 rounded-full">
                      <DollarSign className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Total Orders</p>
                      <p className="text-3xl font-bold text-text">{analytics.totalOrders}</p>
                    </div>
                    <div className="p-3 bg-secondary/10 rounded-full">
                      <Package className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Avg Order Value</p>
                      <p className="text-3xl font-bold text-text">£{analytics.averageOrderValue.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-secondary/10 rounded-full">
                      <TrendingUp className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Total Customers</p>
                      <p className="text-3xl font-bold text-text">{analytics.totalCustomers}</p>
                    </div>
                    <div className="p-3 bg-secondary/10 rounded-full">
                      <Users className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Orders by Status */}
              <Card className="p-6 mb-8">
                <h2 className="text-xl font-bold text-text mb-4">Orders by Status</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                    <div key={status} className="p-4 bg-tertiary rounded-lg">
                      <div className="text-sm text-text-secondary mb-1">{status.replace('_', ' ')}</div>
                      <div className="text-2xl font-bold text-text">{count}</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Revenue Chart */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-text mb-4">Revenue Trend</h2>
                <div className="space-y-4">
                  {analytics.revenueByDay.map((day, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-24 text-sm text-text-secondary">
                        {new Date(day.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-8 bg-secondary rounded"
                            style={{ width: `${(day.revenue / analytics.totalRevenue) * 100}%` }}
                          />
                          <span className="text-sm text-text">£{day.revenue.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="text-sm text-text-secondary w-20 text-right">
                        {day.orders} orders
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-6">
              <p className="text-text-secondary">No analytics data available</p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

