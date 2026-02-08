'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Truck, 
  Package, 
  DollarSign,
  TrendingUp,
  Settings,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  MoreVertical,
  LogOut,
  Menu as MenuIcon,
  BarChart3,
  Shield
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import InstallPrompt from '@/components/InstallPrompt';

interface DashboardStats {
  totalUsers: number;
  totalDrivers: number;
  activeDrivers: number;
  totalOrders: number;
  todayRevenue: number;
  pendingOrders: number;
}

interface Driver {
  id: string;
  phone: string;
  vehicleInfo: string;
  isAvailable: boolean;
  rating: number;
  totalDeliveries: number;
  user: {
    name: string;
    email: string;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalDrivers: 0,
    activeDrivers: 0,
    totalOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
  });
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'drivers' | 'users' | 'orders'>('overview');

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      }

      // Fetch drivers
      const driversResponse = await fetch('/api/drivers');
      if (driversResponse.ok) {
        const driversData = await driversResponse.json();
        if (driversData.success) {
          setDrivers(driversData.drivers);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;
    
    try {
      const response = await fetch(`/api/admin/drivers/${driverId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setDrivers(drivers.filter(d => d.id !== driverId));
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error deleting driver:', error);
      alert('Failed to delete driver');
    }
  };

  const toggleDriverStatus = async (driverId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/drivers/${driverId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentStatus }),
      });
      
      if (response.ok) {
        setDrivers(drivers.map(d => 
          d.id === driverId ? { ...d, isAvailable: !currentStatus } : d
        ));
      }
    } catch (error) {
      console.error('Error updating driver status:', error);
    }
  };

  return (
    <>
      <InstallPrompt />
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <header className="bg-black/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Shield className="h-8 w-8 text-secondary" />
                <div>
                  <h1 className="text-xl font-bold text-text">Admin Panel</h1>
                  <p className="text-sm text-text-secondary">System Management</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="outline" size="sm">
                    View Site
                  </Button>
                </Link>
                <Button variant="ghost" size="sm">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="bg-black/40 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-text-secondary hover:text-text hover:border-text-secondary'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('drivers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'drivers'
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-text-secondary hover:text-text hover:border-text-secondary'
                }`}
              >
                Drivers
              </button>
              <Link
                href="/admin/users"
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'users'
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-text-secondary hover:text-text hover:border-text-secondary'
                }`}
              >
                Users
              </Link>
              <Link
                href="/admin/orders"
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'orders'
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-text-secondary hover:text-text hover:border-text-secondary'
                }`}
              >
                Orders
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 hover-lift">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Total Users</p>
                      <p className="text-3xl font-bold text-text">
                        {loading ? '...' : stats.totalUsers}
                      </p>
                    </div>
                    <div className="p-3 bg-secondary/10 rounded-full">
                      <Users className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover-lift">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Total Drivers</p>
                      <p className="text-3xl font-bold text-text">
                        {loading ? '...' : stats.totalDrivers}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {stats.activeDrivers} active
                      </p>
                    </div>
                    <div className="p-3 bg-secondary/10 rounded-full">
                      <Truck className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover-lift">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Total Orders</p>
                      <p className="text-3xl font-bold text-text">
                        {loading ? '...' : stats.totalOrders}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {stats.pendingOrders} pending
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

                <Card className="p-6 hover-lift">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Pending Orders</p>
                      <p className="text-3xl font-bold text-text">
                        {loading ? '...' : stats.pendingOrders}
                      </p>
                    </div>
                    <div className="p-3 bg-secondary/10 rounded-full">
                      <Package className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/admin/drivers">
                  <Card className="p-6 hover-lift cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <Truck className="h-8 w-8 text-secondary" />
                    </div>
                    <h3 className="text-lg font-semibold text-text mb-2">Manage Drivers</h3>
                    <p className="text-text-secondary text-sm">
                      View, add, edit, and manage driver accounts
                    </p>
                  </Card>
                </Link>

                <Link href="/admin/users">
                  <Card className="p-6 hover-lift cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <Users className="h-8 w-8 text-secondary" />
                    </div>
                    <h3 className="text-lg font-semibold text-text mb-2">Manage Users</h3>
                    <p className="text-text-secondary text-sm">
                      View and manage all user accounts
                    </p>
                  </Card>
                </Link>

                <Link href="/admin/orders">
                  <Card className="p-6 hover-lift cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <Package className="h-8 w-8 text-secondary" />
                    </div>
                    <h3 className="text-lg font-semibold text-text mb-2">View All Orders</h3>
                    <p className="text-text-secondary text-sm">
                      Monitor and manage all system orders
                    </p>
                  </Card>
                </Link>

                <Link href="/admin/analytics">
                  <Card className="p-6 hover-lift cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <BarChart3 className="h-8 w-8 text-secondary" />
                    </div>
                    <h3 className="text-lg font-semibold text-text mb-2">Analytics</h3>
                    <p className="text-text-secondary text-sm">
                      View system analytics and reports
                    </p>
                  </Card>
                </Link>
              </div>
            </>
          )}

          {activeTab === 'drivers' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-text">Driver Management</h2>
                <Link href="/admin/drivers/new">
                  <Button variant="primary">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Driver
                  </Button>
                </Link>
              </div>

              <Card className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
                    <p className="text-text-secondary">Loading drivers...</p>
                  </div>
                ) : drivers.length === 0 ? (
                  <div className="text-center py-12">
                    <Truck className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                    <p className="text-text-secondary mb-4">No drivers found</p>
                    <Link href="/admin/drivers/new">
                      <Button variant="primary">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add First Driver
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-text-secondary font-medium">Name</th>
                          <th className="text-left py-3 px-4 text-text-secondary font-medium">Email</th>
                          <th className="text-left py-3 px-4 text-text-secondary font-medium">Phone</th>
                          <th className="text-left py-3 px-4 text-text-secondary font-medium">Vehicle</th>
                          <th className="text-left py-3 px-4 text-text-secondary font-medium">Status</th>
                          <th className="text-left py-3 px-4 text-text-secondary font-medium">Rating</th>
                          <th className="text-left py-3 px-4 text-text-secondary font-medium">Deliveries</th>
                          <th className="text-right py-3 px-4 text-text-secondary font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drivers.map((driver) => (
                          <tr key={driver.id} className="border-b border-border hover:bg-tertiary/50">
                            <td className="py-3 px-4 text-text">{driver.user.name}</td>
                            <td className="py-3 px-4 text-text-secondary">{driver.user.email}</td>
                            <td className="py-3 px-4 text-text-secondary">{driver.phone}</td>
                            <td className="py-3 px-4 text-text-secondary">
                              {driver.vehicleInfo 
                                ? (typeof driver.vehicleInfo === 'object' && driver.vehicleInfo !== null
                                    ? (() => {
                                        const v = driver.vehicleInfo as Record<string, string | undefined>;
                                        return `${v.type || ''} ${v.model || ''} ${v.color || ''} ${v.licensePlate || ''}`.trim() || 'N/A';
                                      })()
                                    : String(driver.vehicleInfo))
                                : 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => toggleDriverStatus(driver.id, driver.isAvailable)}
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  driver.isAvailable
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}
                              >
                                {driver.isAvailable ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-text-secondary">
                              {driver.rating > 0 ? `${driver.rating.toFixed(1)} ⭐` : 'No rating'}
                            </td>
                            <td className="py-3 px-4 text-text-secondary">{driver.totalDeliveries}</td>
                            <td className="py-3 px-4">
                              <div className="flex justify-end space-x-2">
                                <Link href={`/admin/drivers/${driver.id}/edit`}>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteDriver(driver.id)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

        </main>
      </div>
    </>
  );
}

