'use client';

import { useState, useEffect } from 'react';
import { Package, Search, Filter, Eye, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import InstallPrompt from '@/components/InstallPrompt';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderType: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  driver?: {
    id: string;
    user: {
      name: string;
    };
  };
}

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders?limit=100');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'CONFIRMED':
      case 'PREPARING':
        return 'bg-blue-500/20 text-blue-400';
      case 'READY_FOR_PICKUP':
      case 'READY_FOR_DELIVERY':
        return 'bg-green-500/20 text-green-400';
      case 'OUT_FOR_DELIVERY':
        return 'bg-purple-500/20 text-purple-400';
      case 'DELIVERED':
        return 'bg-gray-500/20 text-gray-400';
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500/20 text-green-400';
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'FAILED':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => ['PENDING', 'CONFIRMED', 'PREPARING'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    revenue: orders.filter(o => o.paymentStatus === 'COMPLETED').reduce((sum, o) => sum + o.total, 0),
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
            <h1 className="text-3xl font-bold text-text">Order Management</h1>
            <p className="text-text-secondary mt-2">View and manage all system orders</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-sm text-text-secondary mb-1">Total Orders</div>
              <div className="text-2xl font-bold text-text">{stats.total}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-text-secondary mb-1">Pending</div>
              <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-text-secondary mb-1">Delivered</div>
              <div className="text-2xl font-bold text-green-400">{stats.delivered}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-text-secondary mb-1">Total Revenue</div>
              <div className="text-2xl font-bold text-text">£{stats.revenue.toFixed(2)}</div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search by order number, customer name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-tertiary border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-tertiary border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PREPARING">Preparing</option>
                <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-4 py-2 bg-tertiary border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="all">All Payments</option>
                <option value="COMPLETED">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </Card>

          {/* Orders Table */}
          <Card className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
                <p className="text-text-secondary">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                <p className="text-text-secondary">No orders found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">Order #</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">Customer</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">Payment</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">Driver</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">Total</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">Date</th>
                      <th className="text-right py-3 px-4 text-text-secondary font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border hover:bg-tertiary/50">
                        <td className="py-3 px-4 text-text font-medium">{order.orderNumber}</td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="text-text">{order.customerName}</div>
                            <div className="text-xs text-text-secondary">{order.customerEmail}</div>
                            <div className="text-xs text-text-secondary">{order.customerPhone}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize text-text-secondary">{order.orderType.toLowerCase()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {order.driver ? (
                            <div className="flex items-center text-text-secondary">
                              <Truck className="h-3 w-3 mr-1" />
                              <span className="text-sm">{order.driver.user.name}</span>
                            </div>
                          ) : (
                            <span className="text-text-secondary text-sm">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-text font-medium">£{order.total.toFixed(2)}</td>
                        <td className="py-3 px-4 text-text-secondary text-sm">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end">
                            <Link href={`/admin/orders/${order.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <div className="mt-4 text-sm text-text-secondary">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      </div>
    </>
  );
}

