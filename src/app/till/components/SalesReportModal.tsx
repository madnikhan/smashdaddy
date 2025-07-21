'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface SalesReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SalesReport {
  period: string;
  startDate: string;
  endDate: string;
  summary: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
  breakdowns: {
    paymentMethods: Record<string, number>;
    orderTypes: Record<string, number>;
    statusBreakdown: Record<string, number>;
  };
  topItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  hourlySales: Record<number, number>;
  orders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    paymentMethod: string;
    orderType: string;
    createdAt: string;
  }>;
}

export default function SalesReportModal({ isOpen, onClose }: SalesReportModalProps) {
  const [report, setReport] = useState<SalesReport | null>(null);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/reports/sales?period=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sales report');
      }
      
      const data = await response.json();
      if (data.success) {
        setReport(data.report);
      } else {
        throw new Error(data.error || 'Failed to fetch sales report');
      }
    } catch (error) {
      console.error('Error fetching sales report:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch sales report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReport();
    }
  }, [isOpen, period]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <Card className="bg-gray-900 border border-gray-700">
          <div className="border-b border-gray-700 p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Sales Report</h2>
              <div className="flex gap-2">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as any)}
                  className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  ✕
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
                <Button 
                  onClick={() => setError(null)}
                  className="mt-2 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400"
                >
                  Dismiss
                </Button>
              </div>
            )}

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                <p className="text-gray-300">Generating sales report...</p>
              </div>
            )}

            {report && !loading && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20">
                    <div className="text-center p-4">
                      <div className="text-3xl font-bold text-yellow-400 mb-1">
                        {report.summary.totalOrders}
                      </div>
                      <div className="text-sm text-gray-300">Total Orders</div>
                    </div>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20">
                    <div className="text-center p-4">
                      <div className="text-3xl font-bold text-green-400 mb-1">
                        {formatCurrency(report.summary.totalRevenue)}
                      </div>
                      <div className="text-sm text-gray-300">Total Revenue</div>
                    </div>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20">
                    <div className="text-center p-4">
                      <div className="text-3xl font-bold text-blue-400 mb-1">
                        {formatCurrency(report.summary.averageOrderValue)}
                      </div>
                      <div className="text-sm text-gray-300">Average Order Value</div>
                    </div>
                  </Card>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="font-semibold text-white mb-2">Report Period</h3>
                  <p className="text-gray-300">
                    {formatDate(report.startDate)} - {formatDate(report.endDate)}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-800 border border-gray-700">
                    <div className="border-b border-gray-700">
                      <h3 className="text-lg font-bold text-white p-4">Payment Methods</h3>
                    </div>
                    <div className="p-4 space-y-2">
                      {Object.entries(report.breakdowns.paymentMethods).map(([method, count]) => (
                        <div key={method} className="flex justify-between items-center">
                          <span className="text-white capitalize">{method}</span>
                          <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            {count} orders
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="bg-gray-800 border border-gray-700">
                    <div className="border-b border-gray-700">
                      <h3 className="text-lg font-bold text-white p-4">Top Selling Items</h3>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        {report.topItems.slice(0, 5).map((item, index) => (
                          <div key={item.name} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                #{index + 1}
                              </Badge>
                              <span className="text-white font-medium">{item.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-semibold">{item.quantity} sold</div>
                              <div className="text-sm text-gray-400">{formatCurrency(item.revenue)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
