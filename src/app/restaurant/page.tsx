'use client';

import { useState, useEffect } from 'react';
import { 
  Truck, 
  Clock, 
  TrendingUp, 
  DollarSign,
  Package,
  ChefHat,
  Settings,
  Menu,
  Bell,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  orderType: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  itemCount: number;
}

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  activeDrivers: number;
}

export default function RestaurantDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    activeDrivers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      const ordersResponse = await fetch('/api/orders?limit=20');
      const ordersData = await ordersResponse.json();

      if (ordersData.success) {
        setOrders(ordersData.orders);

        // Calculate stats
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = ordersData.orders.filter((order: Order) => 
          order.createdAt.startsWith(today)
        );
        
        const todayRevenue = todayOrders.reduce((sum: number, order: Order) => 
          sum + order.total, 0
        );
        
        const pendingOrders = ordersData.orders.filter((order: Order) => 
          ['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status)
        ).length;

        // Fetch active drivers
        let activeDriversCount = 0;
        try {
          const driversResponse = await fetch('/api/drivers/active');
          const driversData = await driversResponse.json();
          activeDriversCount = driversData.success ? driversData.drivers.length : 0;
        } catch (error) {
          console.error('Error fetching active drivers:', error);
          activeDriversCount = 0;
        }
        
        setStats({
          todayOrders: todayOrders.length,
          todayRevenue,
          pendingOrders,
          activeDrivers: activeDriversCount,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
        return 'bg-green-500/20 text-green-400';
      case 'OUT_FOR_DELIVERY':
        return 'bg-purple-500/20 text-purple-400';
      case 'DELIVERED':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <ChefHat className="h-8 w-8 text-secondary" />
              <div>
                <h1 className="text-xl font-bold text-text">SmashDaddy Restaurant</h1>
                <p className="text-sm text-text-secondary">Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/kitchen">
                <Button variant="outline" size="sm">
                  <Menu className="h-4 w-4 mr-2" />
                  Kitchen
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">Today&apos;s Orders</p>
                <p className="text-3xl font-bold text-text">
                  {loading ? '...' : stats.todayOrders}
                </p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-full">
                <Package className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">Today&apos;s Revenue</p>
                <p className="text-3xl font-bold text-text">
                  {loading ? '...' : `£${stats.todayRevenue.toFixed(2)}`}
                </p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-full">
                <DollarSign className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">Pending Orders</p>
                <p className="text-3xl font-bold text-text">
                  {loading ? '...' : stats.pendingOrders}
                </p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-full">
                <Clock className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">Active Drivers</p>
                <p className="text-3xl font-bold text-text">
                  {loading ? '...' : stats.activeDrivers}
                </p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-full">
                <Truck className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/kitchen">
            <Card className="p-6 hover-lift cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <ChefHat className="h-8 w-8 text-secondary" />
                <ChevronRight className="h-5 w-5 text-text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Kitchen Display</h3>
              <p className="text-text-secondary text-sm">
                View and manage pending orders in real-time
              </p>
            </Card>
          </Link>

          <Link href="/api/reports/sales">
            <Card className="p-6 hover-lift cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="h-8 w-8 text-secondary" />
                <ChevronRight className="h-5 w-5 text-text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Analytics</h3>
              <p className="text-text-secondary text-sm">
                View sales reports and performance metrics
              </p>
            </Card>
          </Link>

          <Link href="/till">
            <Card className="p-6 hover-lift cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <Settings className="h-8 w-8 text-secondary" />
                <ChevronRight className="h-5 w-5 text-text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Till System</h3>
              <p className="text-text-secondary text-sm">
                Manage in-store orders and payments
              </p>
            </Card>
          </Link>
        </div>

        {/* Recent Orders */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-text">Recent Orders</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 10).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-tertiary rounded-lg hover:bg-tertiary/80 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-semibold text-text">Order #{order.orderNumber}</p>
                        <p className="text-sm text-text-secondary">
                          {order.customerName} • {order.itemCount} items
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-text-secondary">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(order.createdAt).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="capitalize">{order.orderType.toLowerCase()}</span>
                      <span>£{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
