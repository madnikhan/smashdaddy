'use client'

import { useState, useEffect } from 'react'
import { 
  Bell, 
  BellOff, 
  Search, 
  Filter, 
  Plus, 
  Printer, 
  BarChart3, 
  Clock, 
  User, 
  CreditCard, 
  X, 
  ShoppingCart, 
  MapPin 
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import InstallPrompt from '@/components/InstallPrompt'
import dynamic from 'next/dynamic';

// Dynamically import DriverTrackingMap to avoid chunk loading issues
const DriverTrackingMap = dynamic(() => import('@/components/DriverTrackingMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading driver map...</p>
      </div>
    </div>
  ),
});

// Client-side only time display component
function TimeDisplay() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString())
    }
    
    updateTime() // Set initial time
    const interval = setInterval(updateTime, 1000) // Update every second
    
    return () => clearInterval(interval)
  }, [])

  return <span>{time}</span>
}

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  description?: string
  isAvailable: boolean
}

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  orderNumber?: string
  customerName: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'preparing' | 'ready_for_pickup' | 'delivered'
  type: 'delivery' | 'collection' | 'takeaway'
  createdAt: string
  paymentStatus: 'pending' | 'paid'
  driverId?: string // Added driverId to the interface
}

export default function TillPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loadingOrders, setLoadingOrders] = useState(true)
  
  // New order state
  const [newOrderCustomer, setNewOrderCustomer] = useState('')
  const [newOrderType, setNewOrderType] = useState<'delivery' | 'collection' | 'takeaway'>('takeaway')
  const [newOrderItems, setNewOrderItems] = useState<OrderItem[]>([])
  const [menuSearchTerm, setMenuSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [creatingOrder, setCreatingOrder] = useState(false)
  
  // Menu items state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loadingMenu, setLoadingMenu] = useState(true)

  // Orders needing driver assignment state
  const [ordersNeedingDrivers, setOrdersNeedingDrivers] = useState<Order[]>([]);
  const [showDriverAssignmentModal, setShowDriverAssignmentModal] = useState(false);
  const [showDriverTrackingModal, setShowDriverTrackingModal] = useState(false);
  const [activeDrivers, setActiveDrivers] = useState<any[]>([]);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true)
      const response = await fetch('/api/orders?limit=100').catch((fetchError) => {
        console.error('[TillPage] Network error fetching orders:', fetchError);
        return null;
      });

      if (!response || !response.ok) {
        if (response) {
          const errorText = await response.text().catch(() => '');
          console.error('[TillPage] Failed to fetch orders:', response.status, errorText);
        }
        return; // Silently fail - don't disrupt existing orders
      }

      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('[TillPage] Expected JSON but got:', contentType);
        return;
      }

      const data = await response.json().catch((parseError) => {
        console.error('[TillPage] Error parsing orders response:', parseError);
        return null;
      });
      
      if (data && data.success) {
        setOrders(data.orders.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          items: order.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.unitPrice
          })),
          total: order.total,
          status: order.status.toLowerCase(),
          type: order.orderType.toLowerCase(),
          createdAt: order.createdAt,
          paymentStatus: order.paymentStatus.toLowerCase(),
          driverId: order.driverId // Ensure driverId is mapped
        })))
      }
    } catch (error) {
      // Only log unexpected errors
      if (error instanceof Error && !error.message.includes('fetch')) {
        console.error('[TillPage] Unexpected error fetching orders:', error);
      }
    } finally {
      setLoadingOrders(false)
    }
  }

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoadingMenu(true)
        const response = await fetch('/api/menu?available=true').catch((fetchError) => {
          console.error('[TillPage] Network error fetching menu items:', fetchError);
          return null;
        });

        if (!response || !response.ok) {
          // Fallback to basic items if API fails
          setMenuItems([
            { id: '1', name: 'Single Smash Burger', price: 6.99, category: 'BURGERS', description: 'Smashed patties with STACK\'D sauce', isAvailable: true },
            { id: '2', name: 'Double Smash Burger', price: 8.49, category: 'BURGERS', description: 'Double smashed patties with STACK\'D sauce', isAvailable: true },
            { id: '3', name: '1/4 Grilled Chicken', price: 5.99, category: 'GRILLED CHICKEN', description: 'Flame-grilled peri chicken', isAvailable: true },
            { id: '4', name: 'Regular Fries', price: 2.49, category: 'SIDES', description: 'Crispy golden fries', isAvailable: true },
          ]);
          return;
        }

        // Check content type before parsing
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('[TillPage] Expected JSON but got:', contentType);
          // Use fallback
          setMenuItems([
            { id: '1', name: 'Single Smash Burger', price: 6.99, category: 'BURGERS', description: 'Smashed patties with STACK\'D sauce', isAvailable: true },
            { id: '2', name: 'Double Smash Burger', price: 8.49, category: 'BURGERS', description: 'Double smashed patties with STACK\'D sauce', isAvailable: true },
            { id: '3', name: '1/4 Grilled Chicken', price: 5.99, category: 'GRILLED CHICKEN', description: 'Flame-grilled peri chicken', isAvailable: true },
            { id: '4', name: 'Regular Fries', price: 2.49, category: 'SIDES', description: 'Crispy golden fries', isAvailable: true },
          ]);
          return;
        }

        const data = await response.json().catch((parseError) => {
          console.error('[TillPage] Error parsing menu response:', parseError);
          return null;
        });
        
        if (data && data.success) {
          setMenuItems(data.menuItems.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            category: item.category.name,
            description: item.description,
            isAvailable: item.isAvailable
          })))
        } else {
          // Fallback if response is invalid
          setMenuItems([
            { id: '1', name: 'Single Smash Burger', price: 6.99, category: 'BURGERS', description: 'Smashed patties with STACK\'D sauce', isAvailable: true },
            { id: '2', name: 'Double Smash Burger', price: 8.49, category: 'BURGERS', description: 'Double smashed patties with STACK\'D sauce', isAvailable: true },
            { id: '3', name: '1/4 Grilled Chicken', price: 5.99, category: 'GRILLED CHICKEN', description: 'Flame-grilled peri chicken', isAvailable: true },
            { id: '4', name: 'Regular Fries', price: 2.49, category: 'SIDES', description: 'Crispy golden fries', isAvailable: true },
          ]);
        }
      } catch (error) {
        // Only log unexpected errors
        if (error instanceof Error && !error.message.includes('fetch')) {
          console.error('[TillPage] Unexpected error fetching menu items:', error);
        }
        // Always provide fallback
        setMenuItems([
          { id: '1', name: 'Single Smash Burger', price: 6.99, category: 'BURGERS', description: 'Smashed patties with STACK\'D sauce', isAvailable: true },
          { id: '2', name: 'Double Smash Burger', price: 8.49, category: 'BURGERS', description: 'Double smashed patties with STACK\'D sauce', isAvailable: true },
          { id: '3', name: '1/4 Grilled Chicken', price: 5.99, category: 'GRILLED CHICKEN', description: 'Flame-grilled peri chicken', isAvailable: true },
          { id: '4', name: 'Regular Fries', price: 2.49, category: 'SIDES', description: 'Crispy golden fries', isAvailable: true },
        ]);
      } finally {
        setLoadingMenu(false)
      }
    }

    fetchMenuItems()
  }, [])

  // Fetch available drivers
  const fetchAvailableDrivers = async () => {
    try {
      console.log('Fetching available drivers...');
      const response = await fetch('/api/drivers/available?t=' + Date.now(), {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        console.error('Failed to fetch available drivers:', response.status, response.statusText);
        return;
      }

      const data = await response.json();
      console.log('Available drivers response:', data);
      
      if (data.success) {
        setAvailableDrivers(data.drivers || []);
      } else {
        console.error('Failed to fetch available drivers:', data.error);
      }
    } catch (error) {
      console.error('Error fetching available drivers:', error);
    }
  };

  // Fetch active drivers with locations
  const fetchActiveDrivers = async () => {
    try {
      setTrackingLoading(true);
      const response = await fetch('/api/drivers/active?includeLocation=true&t=' + Date.now(), {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        console.error('Failed to fetch active drivers:', response.status, response.statusText);
        return;
      }

      const data = await response.json();
      console.log('Active drivers response:', data);
      
      if (data.success) {
        setActiveDrivers(data.drivers || []);
      } else {
        console.error('Failed to fetch active drivers:', data.error);
      }
    } catch (error) {
      console.error('Error fetching active drivers:', error);
    } finally {
      setTrackingLoading(false);
    }
  };

  // Show driver tracking modal
  const openDriverTrackingModal = () => {
    fetchActiveDrivers();
    setShowDriverTrackingModal(true);
  };

  // Assign driver to order
  const assignDriver = async (orderId: string, driverId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'OUT_FOR_DELIVERY',
          driverId: driverId,
        }),
      });

      if (response.ok) {
        // Refresh orders
        fetchOrders();
        setSelectedOrder(null);
        setShowDriverAssignmentModal(false); // Close modal after assignment
        // Show success message
        alert(`Driver assigned successfully to order ${orderId}`);
      }
    } catch (error) {
      console.error('Error assigning driver:', error);
      alert('Failed to assign driver. Please try again.');
    }
  };

  // Show driver assignment modal
  const showDriverAssignment = (order: Order) => {
    setSelectedOrder(order);
    fetchAvailableDrivers();
  };

  // Show driver assignment modal for all orders
  const openDriverAssignmentModal = () => {
    fetchAvailableDrivers();
    // Get orders that need driver assignment (delivery orders without drivers)
    const ordersNeedingDrivers = orders.filter(order => 
      order.type === 'delivery' && 
      !order.driverId && 
      ['pending', 'ready_for_pickup'].includes(order.status)
    );
    console.log('Orders needing drivers:', ordersNeedingDrivers);
    console.log('All orders:', orders);
    setOrdersNeedingDrivers(ordersNeedingDrivers);
    setShowDriverAssignmentModal(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Get unique categories for tabs
  const categories = ['all', ...Array.from(new Set(menuItems.map(item => item.category)))]

  const filteredMenuItems = menuItems.filter(item =>
    (item.name.toLowerCase().includes(menuSearchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(menuSearchTerm.toLowerCase())) &&
    item.isAvailable &&
    (selectedCategory === 'all' || item.category === selectedCategory)
  )

  const stats = {
    active: orders.filter(o => ['pending', 'preparing', 'ready_for_pickup'].includes(o.status)).length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready_for_pickup').length
  }

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Refresh orders to get updated data
        await fetchOrders()
        
        // Update selected order if it's the one being updated
        if (selectedOrder && selectedOrder.id === orderId) {
          const updatedOrder = orders.find(o => o.id === orderId)
          if (updatedOrder) {
            setSelectedOrder({ ...updatedOrder, status: newStatus })
          }
        }
      } else {
        let errorData: { error?: string } = {};
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: 'Non-JSON error response' };
        }
        console.error('Failed to update order status:', errorData, response.status, response.statusText);
        throw new Error(errorData.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error; // Re-throw to show error in UI
    }
  }

  const processPayment = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          paymentStatus: 'COMPLETED',
          paymentMethod: 'CASH'
        }),
      })

      if (response.ok) {
        // Refresh orders to get updated data
        await fetchOrders()
        
        // Update selected order if it's the one being updated
        if (selectedOrder && selectedOrder.id === orderId) {
          const updatedOrder = orders.find(o => o.id === orderId)
          if (updatedOrder) {
            setSelectedOrder({ ...updatedOrder, paymentStatus: 'paid' })
          }
        }
      } else {
        console.error('Failed to process payment')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
    }
  }

  const addItemToOrder = (menuItem: MenuItem) => {
    setNewOrderItems(prev => {
      const existingItem = prev.find(item => item.id === menuItem.id)
      if (existingItem) {
        return prev.map(item =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prev, { ...menuItem, quantity: 1 }]
      }
    })
  }

  const removeItemFromOrder = (itemId: string) => {
    setNewOrderItems(prev => prev.filter(item => item.id !== itemId))
  }

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromOrder(itemId)
      return
    }
    setNewOrderItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ))
  }

  const getNewOrderTotal = () => {
    return newOrderItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const createNewOrder = async () => {
    if (!newOrderCustomer.trim() || newOrderItems.length === 0) return

    try {
      setCreatingOrder(true)

      const orderData = {
        customerName: newOrderCustomer,
        customerEmail: 'till@stackd.co.uk', // Default email for till orders
        customerPhone: '0000000000', // Default phone for till orders
        orderType: newOrderType.toUpperCase(),
        items: newOrderItems,
        subtotal: getNewOrderTotal(),
        tax: 0, // No tax for now
        deliveryFee: newOrderType === 'delivery' ? 2.99 : 0,
        specialInstructions: '',
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Refresh orders to include the new order
        await fetchOrders()
        
        // Select the new order
        const newOrder = {
          id: data.order.id,
          customerName: data.order.customerName,
          items: data.order.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.unitPrice
          })),
          total: data.order.total,
          status: data.order.status.toLowerCase(),
          type: data.order.orderType.toLowerCase(),
          createdAt: data.order.createdAt,
          paymentStatus: data.order.paymentStatus.toLowerCase()
        }
        
        setSelectedOrder(newOrder)
        
        // Reset form
        setNewOrderCustomer('')
        setNewOrderType('takeaway')
        setNewOrderItems([])
        setSelectedCategory('all')
        setMenuSearchTerm('')
        setShowNewOrderModal(false)
      } else {
        let errorData: { error?: string } = {};
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: 'Non-JSON error response' };
        }
        console.error('Failed to create order:', errorData, response.status, response.statusText);
        throw new Error(errorData.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error)
    } finally {
      setCreatingOrder(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 text-black'
      case 'preparing': return 'bg-orange-500 text-white'
      case 'ready_for_pickup': return 'bg-green-500 text-white'
      case 'delivered': return 'bg-gray-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'preparing': return '👨‍🍳'
      case 'ready_for_pickup': return '✅'
      case 'delivered': return '🎉'
      default: return '📋'
    }
  }

  return (
    <>
      <InstallPrompt />
    <div className="min-h-screen bg-gradient-primary">
      {/* Header */}
      <header className="bg-black/90 backdrop-blur-sm border-b border-gray-700 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient">SmashDaddy Till</h1>
            <p className="text-sm text-text-secondary">Order Management System</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowNewOrderModal(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Order</span>
            </Button>
            
            <Button
              variant={soundEnabled ? "primary" : "secondary"}
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center space-x-2"
            >
              {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={openDriverAssignmentModal}
              className="flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Assign Drivers</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={openDriverTrackingModal}
              className="flex items-center space-x-2"
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Track Drivers</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-tertiary border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-text">Active: {stats.active}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-text">Pending: {stats.pending}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium text-text">Preparing: {stats.preparing}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-text">Ready: {stats.ready}</span>
            </div>
          </div>
          
          <div className="text-sm text-text-secondary">
            <TimeDisplay />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      {showFilters && (
        <div className="bg-tertiary border-b border-gray-700 px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search orders by customer name or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-48"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Orders List */}
        <div className="w-1/2 bg-tertiary border-r border-gray-700 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-text mb-6 flex items-center">
              <span className="mr-2">📋</span>
              Orders
            </h2>
            {loadingOrders ? (
              <div className="text-center py-12">
                <div className="spinner w-8 h-8 mx-auto mb-4"></div>
                <p className="text-text-secondary">Loading orders...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`card cursor-pointer transition-all duration-200 hover-lift ${
                      selectedOrder?.id === order.id
                        ? 'border-yellow-500 bg-yellow-500/10'
                        : 'hover:border-gray-600'
                    }`}
                  >
                    <div className="card-content">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getStatusIcon(order.status)}</span>
                          <div>
                            <span className="font-bold text-text">{order.orderNumber ? `#${order.orderNumber}` : `#${order.id}`}</span>
                            <div className="flex items-center space-x-2 mt-1">
                              <User className="w-4 h-4 text-text-secondary" />
                              <span className="text-sm text-text-secondary">{order.customerName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`badge ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <div className="mt-1 text-lg font-bold text-gradient">
                            £{order.total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-text-secondary capitalize">{order.type}</span>
                          <div className="flex items-center space-x-1">
                            <CreditCard className="w-4 h-4" />
                            <span className={order.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}>
                              {order.paymentStatus}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-text-secondary">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredOrders.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🍕</div>
                    <p className="text-text-secondary">No orders found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="w-1/2 bg-secondary/5 p-6 overflow-y-auto">
          {selectedOrder ? (
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getStatusIcon(selectedOrder.status)}</span>
                    <div>
                      <h3 className="text-2xl font-bold text-text">Order #{selectedOrder.orderNumber ? `#${selectedOrder.orderNumber}` : `#${selectedOrder.id}`}</h3>
                      <p className="text-text-secondary">Customer: {selectedOrder.customerName}</p>
                    </div>
                  </div>
                  <span className={`badge ${getStatusColor(selectedOrder.status)} text-sm`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              <div className="card-content space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-tertiary p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium text-text">Customer</span>
                    </div>
                    <p className="text-text-secondary">{selectedOrder.customerName}</p>
                  </div>
                  
                  <div className="bg-tertiary p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CreditCard className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium text-text">Payment</span>
                    </div>
                    <span className={`text-sm ${selectedOrder.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-bold text-text mb-4 flex items-center">
                    <span className="mr-2">🍽️</span>
                    Order Items
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-tertiary rounded-lg">
                        <div>
                          <span className="font-medium text-text">{item.quantity}x {item.name}</span>
                        </div>
                        <span className="font-bold text-gradient">£{(item.quantity * item.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-text">Total</span>
                    <span className="text-2xl font-bold text-gradient">£{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  {selectedOrder.status === 'pending' && (
                    <Button
                      variant="primary"
                      onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                      className="w-full"
                    >
                      👨‍🍳 Start Preparing
                    </Button>
                  )}
                  
                  {selectedOrder.status === 'preparing' && (
                    <Button
                      variant="primary"
                      onClick={() => updateOrderStatus(selectedOrder.id, 'ready_for_pickup')}
                      className="w-full"
                    >
                      ✅ Mark Ready
                    </Button>
                  )}
                  
                  {selectedOrder.status === 'ready_for_pickup' && selectedOrder.paymentStatus === 'pending' && (
                    <Button
                      variant="primary"
                      onClick={() => processPayment(selectedOrder.id)}
                      className="w-full"
                    >
                      💳 Process Payment
                    </Button>
                  )}
                  
                  {selectedOrder.status === 'ready_for_pickup' && selectedOrder.paymentStatus === 'paid' && (
                    <Button
                      variant="secondary"
                      onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                      className="w-full"
                    >
                      🎉 Complete Order
                    </Button>
                  )}


                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-text mb-2">Select an Order</h3>
              <p className="text-text-secondary">Choose an order from the list to view details and manage it</p>
            </div>
          )}
        </div>
      </div>

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2">
          <div className="bg-tertiary rounded-xl border border-gray-700 shadow-2xl w-full max-w-7xl h-[95vh] overflow-hidden">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-text flex items-center">
                  <Plus className="w-6 h-6 mr-2 text-yellow-500" />
                  Create New Order
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewOrderModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="flex h-[calc(95vh-120px)]">
              {/* Menu Items */}
              <div className="w-2/3 border-r border-gray-700 p-6 overflow-y-auto">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={menuSearchTerm}
                    onChange={(e) => setMenuSearchTerm(e.target.value)}
                    className="input w-full"
                  />
                </div>

                {/* Category Tabs */}
                {!loadingMenu && categories.length > 1 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            selectedCategory === category
                              ? 'bg-yellow-500 text-black shadow-lg'
                              : 'bg-tertiary text-text-secondary hover:bg-gray-600 hover:text-text'
                          }`}
                        >
                          {category === 'all' ? '🍽️ All Items' : category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {loadingMenu ? (
                  <div className="text-center py-8">
                    <div className="spinner w-8 h-8 mx-auto mb-4"></div>
                    <p className="text-text-secondary">Loading menu items...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredMenuItems.map((item) => (
                      <div
                        key={item.id}
                        className="card cursor-pointer hover-lift"
                        onClick={() => addItemToOrder(item)}
                      >
                        <div className="card-content">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-text text-lg">{item.name}</h3>
                              <p className="text-sm text-text-secondary mt-1">{item.description}</p>
                              <span className="text-xs text-yellow-500 mt-2 inline-block">{item.category}</span>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-xl font-bold text-gradient">£{item.price.toFixed(2)}</div>
                              <Button variant="primary" size="sm" className="mt-2">
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {filteredMenuItems.length === 0 && (
                      <div className="col-span-full text-center py-12 text-text-secondary">
                        <div className="text-6xl mb-4">🍽️</div>
                        <p className="text-lg">No menu items found</p>
                        <p className="text-sm">
                          {selectedCategory !== 'all' 
                            ? `No items in ${selectedCategory} category` 
                            : 'Try adjusting your search or category filter'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="w-1/3 p-6 flex flex-col">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-text mb-4 flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Order Summary
                  </h3>

                  {/* Customer Details */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">Customer Name</label>
                      <input
                        type="text"
                        placeholder="Enter customer name..."
                        value={newOrderCustomer}
                        onChange={(e) => setNewOrderCustomer(e.target.value)}
                        className="input w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">Order Type</label>
                      <select
                        value={newOrderType}
                        onChange={(e) => setNewOrderType(e.target.value as any)}
                        className="input w-full"
                      >
                        <option value="takeaway">Takeaway</option>
                        <option value="collection">Collection</option>
                        <option value="delivery">Delivery</option>
                      </select>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-6">
                    {newOrderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                        <div>
                          <span className="font-medium text-text">{item.name}</span>
                          <div className="text-sm text-text-secondary">£{item.price.toFixed(2)} each</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-medium text-text">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                          <span className="font-bold text-gradient ml-2">£{(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                    
                    {newOrderItems.length === 0 && (
                      <div className="text-center py-8 text-text-secondary">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No items added yet</p>
                        <p className="text-sm">Click on menu items to add them</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total and Create Button */}
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-text">Total</span>
                    <span className="text-2xl font-bold text-gradient">£{getNewOrderTotal().toFixed(2)}</span>
                  </div>
                  
                  <Button
                    variant="primary"
                    onClick={createNewOrder}
                    disabled={!newOrderCustomer.trim() || newOrderItems.length === 0 || creatingOrder}
                    loading={creatingOrder}
                    className="w-full"
                  >
                    {creatingOrder ? 'Creating Order...' : '🍕 Create Order'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Driver Assignment Modal */}
      {showDriverAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Assign Driver to Orders</h3>
              <button
                onClick={() => setShowDriverAssignmentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">Orders Needing Driver Assignment</p>
            </div>

            {loadingDrivers ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading available drivers...</p>
              </div>
            ) : ordersNeedingDrivers.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">No orders needing driver assignment</p>
              </div>
            ) : availableDrivers.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">No drivers available</p>
                <button
                  onClick={fetchAvailableDrivers}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                >
                  Refresh Drivers
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Available Drivers */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Available Drivers ({availableDrivers.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    {availableDrivers.map((driver) => (
                      <div
                        key={driver.id}
                        className="p-3 border rounded-lg bg-green-50 border-green-200"
                      >
                        <p className="font-medium">{driver.user?.name || 'Driver'}</p>
                        <p className="text-sm text-gray-600">
                          Phone: {driver.phone} • Rating: {driver.rating}
                        </p>
                        <p className="text-xs text-gray-500">
                          Vehicle: {
                            driver.vehicleInfo 
                              ? (typeof driver.vehicleInfo === 'object' 
                                  ? `${driver.vehicleInfo.type || ''} ${driver.vehicleInfo.model || ''} ${driver.vehicleInfo.color || ''} ${driver.vehicleInfo.licensePlate || ''}`.trim()
                                  : driver.vehicleInfo)
                              : 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Orders Needing Drivers */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Orders Needing Drivers ({ordersNeedingDrivers.length})</h4>
                  <div className="space-y-2">
                    {ordersNeedingDrivers.map((order) => (
                      <div
                        key={order.id}
                        className="p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Order #{order.orderNumber ? `#${order.orderNumber}` : `#${order.id}`}</p>
                            <p className="text-sm text-gray-600">
                              Customer: {order.customerName} • Type: {order.type} • Status: {order.status}
                            </p>
                            <p className="text-sm text-gray-600">
                              Total: £{order.total.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            {availableDrivers.map((driver) => (
                              <button
                                key={driver.id}
                                onClick={() => assignDriver(order.id, driver.id)}
                                className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary-dark"
                              >
                                Assign {driver.user?.name?.split(' ')[0] || 'Driver'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Driver Tracking Modal */}
      {showDriverTrackingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Live Driver Tracking</h3>
              <button
                onClick={() => setShowDriverTrackingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">Active Drivers with Live Location</p>
            </div>

            {trackingLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading driver locations...</p>
              </div>
            ) : activeDrivers.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">No active drivers with location data</p>
                <button
                  onClick={fetchActiveDrivers}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                >
                  Refresh
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Live Map */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Live Driver Map</h4>
                  <DriverTrackingMap 
                    drivers={activeDrivers}
                    height="400px"
                  />
                </div>

                {/* Driver Details */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Driver Details</h4>
                  <div className="space-y-4">
                    {activeDrivers.map((driver) => (
                      <div
                        key={driver.id}
                        className="p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-lg">{driver.user?.name || 'Driver'}</h4>
                            <p className="text-sm text-gray-600">
                              Phone: {driver.phone} • Rating: {driver.rating} • Vehicle: {
                                driver.vehicleInfo 
                                  ? (typeof driver.vehicleInfo === 'object' 
                                      ? `${driver.vehicleInfo.type || ''} ${driver.vehicleInfo.model || ''} ${driver.vehicleInfo.color || ''} ${driver.vehicleInfo.licensePlate || ''}`.trim()
                                      : driver.vehicleInfo)
                                  : 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-sm text-green-600 font-medium">Active</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              Last updated: {driver.currentLocation?.timestamp ? 
                                new Date(driver.currentLocation.timestamp).toLocaleTimeString() : 
                                'Unknown'
                              }
                            </p>
                          </div>
                        </div>

                        {driver.currentLocation ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Latitude:</span> {driver.currentLocation.latitude.toFixed(6)}
                              </div>
                              <div>
                                <span className="font-medium">Longitude:</span> {driver.currentLocation.longitude.toFixed(6)}
                              </div>
                              {driver.currentLocation.accuracy && (
                                <div>
                                  <span className="font-medium">Accuracy:</span> ±{driver.currentLocation.accuracy.toFixed(0)}m
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No location data available</p>
                        )}

                        {driver.deliveries && driver.deliveries.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <h5 className="font-medium text-sm mb-2">Active Deliveries:</h5>
                            <div className="space-y-1">
                              {driver.deliveries.map((delivery: any) => (
                                <div key={delivery.id} className="text-sm">
                                  <span className="font-medium">Order #{delivery.orderNumber}</span> - 
                                  <span className="text-gray-600"> {delivery.customer?.user?.name}</span>
                                  <span className="text-gray-500 text-xs ml-2">
                                    {delivery.customerAddress}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  )
} 