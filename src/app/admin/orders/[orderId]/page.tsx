'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, User, MapPin, Phone, Mail, Clock, DollarSign, Truck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import InstallPrompt from '@/components/InstallPrompt';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerPostcode: string;
  orderType: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  specialInstructions: string | null;
  createdAt: string;
  items: OrderItem[];
  driver?: {
    id: string;
    user: {
      name: string;
    };
    phone: string;
  };
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.order) {
          setOrder(data.order);
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Failed to load order details');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="p-6">
          <p className="text-text-secondary mb-4">Order not found</p>
          <Link href="/admin/orders">
            <Button variant="primary">Back to Orders</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <>
      <InstallPrompt />
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-text">Order {order.orderNumber}</h1>
                <p className="text-text-secondary mt-2">
                  Placed on {new Date(order.createdAt).toLocaleString('en-GB')}
                </p>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.replace('_', ' ')}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.paymentStatus === 'COMPLETED' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-text mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-secondary" />
                  Order Items
                </h2>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-tertiary rounded-lg">
                      <div>
                        <div className="font-medium text-text">{item.name}</div>
                        <div className="text-sm text-text-secondary">
                          {item.quantity} × £{item.unitPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="font-medium text-text">£{item.totalPrice.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Special Instructions */}
              {order.specialInstructions && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-text mb-4">Special Instructions</h2>
                  <p className="text-text-secondary">{order.specialInstructions}</p>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Info */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-text mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-secondary" />
                  Customer
                </h2>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-text-secondary">Name</div>
                    <div className="text-text">{order.customerName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-text-secondary flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </div>
                    <div className="text-text">{order.customerEmail}</div>
                  </div>
                  <div>
                    <div className="text-sm text-text-secondary flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      Phone
                    </div>
                    <div className="text-text">{order.customerPhone}</div>
                  </div>
                </div>
              </Card>

              {/* Delivery Address */}
              {order.orderType === 'DELIVERY' && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-text mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-secondary" />
                    Delivery Address
                  </h2>
                  <div className="text-text-secondary">
                    <div>{order.customerAddress}</div>
                    {order.customerCity && <div>{order.customerCity}</div>}
                    {order.customerPostcode && <div>{order.customerPostcode}</div>}
                  </div>
                </Card>
              )}

              {/* Driver Info */}
              {order.driver && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-text mb-4 flex items-center">
                    <Truck className="h-5 w-5 mr-2 text-secondary" />
                    Driver
                  </h2>
                  <div className="space-y-2">
                    <div className="text-text">{order.driver.user.name}</div>
                    <div className="text-sm text-text-secondary">{order.driver.phone}</div>
                  </div>
                </Card>
              )}

              {/* Order Summary */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-text mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-secondary" />
                  Order Summary
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal</span>
                    <span>£{order.subtotal.toFixed(2)}</span>
                  </div>
                  {order.tax > 0 && (
                    <div className="flex justify-between text-text-secondary">
                      <span>Tax</span>
                      <span>£{order.tax.toFixed(2)}</span>
                    </div>
                  )}
                  {order.deliveryFee > 0 && (
                    <div className="flex justify-between text-text-secondary">
                      <span>Delivery Fee</span>
                      <span>£{order.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2 mt-2 flex justify-between text-text font-bold text-lg">
                    <span>Total</span>
                    <span>£{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

