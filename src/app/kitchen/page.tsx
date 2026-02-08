"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import InstallPrompt from '@/components/InstallPrompt';
import { Flame, Leaf } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  allergens?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  createdAt: string;
  specialInstructions?: string;
  items: OrderItem[];
  orderType: string; // Added orderType
}

function getTimeDiff(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  return diff;
}

function formatTimeSince(seconds: number) {
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds/60)}m ${seconds%60}s ago`;
  return `${Math.floor(seconds/3600)}h ${Math.floor((seconds%3600)/60)}m ago`;
}

function playAlertSound() {
  const audio = new window.Audio('/notification.mp3');
  audio.play();
}

function flashScreen() {
  const flash = document.createElement('div');
  flash.style.position = 'fixed';
  flash.style.top = '0';
  flash.style.left = '0';
  flash.style.width = '100vw';
  flash.style.height = '100vh';
  flash.style.background = 'rgba(255,255,0,0.2)';
  flash.style.zIndex = '9999';
  flash.style.pointerEvents = 'none';
  document.body.appendChild(flash);
  setTimeout(() => document.body.removeChild(flash), 300);
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [fetchError, setFetchError] = useState<string | null>(null);
  const prevOrderIds = useRef<Set<string>>(new Set<string>());

  // Update 'now' every second for live timers
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders?limit=50').catch((fetchError) => {
        // Handle network errors
        console.error('[KitchenPanel] Network error fetching orders:', fetchError);
        throw fetchError;
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || res.statusText };
        }
        console.error('[KitchenPanel] API error:', res.status, res.statusText, errorData);
        setFetchError(`Failed to fetch orders: ${res.status} ${res.statusText}`);
        setOrders([]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log('[KitchenPanel] Raw API response:', data);
      
      if (data.success) {
        // Clear any previous fetch errors on success
        setFetchError(null);
        
        const filtered = data.orders.filter((o: any) => ['PENDING', 'PREPARING'].includes(o.status?.toUpperCase() || ''))
          .map((order: any) => ({
            ...order,
            items: order.items.map((item: any) => ({
              id: item.id,
              name: item.name || item.menuItemName || '',
              quantity: item.quantity,
              isSpicy: item.isSpicy,
              isVegetarian: item.isVegetarian,
              allergens: item.allergens,
            }))
          }));
        console.log('[KitchenPanel] Filtered orders:', filtered);
        setOrders(filtered);
      } else {
        console.error('[KitchenPanel] API did not return success:', data);
        setFetchError('Failed to fetch orders. Please try refreshing the page.');
        setOrders([]);
      }
    } catch (e) {
      // Handle network errors and other exceptions
      if (e instanceof TypeError && e.message === 'Failed to fetch') {
        console.error('[KitchenPanel] Network error: Unable to fetch orders. Check your connection.');
        setFetchError('Unable to connect to server. Please check your internet connection and ensure the server is running.');
      } else {
        console.error('[KitchenPanel] Error fetching orders:', e);
        setFetchError('An error occurred while fetching orders. Please try refreshing the page.');
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Real-time updates via SSE
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      }).catch((fetchError) => {
        console.error('[KitchenPanel] Network error updating order status:', fetchError);
        throw fetchError;
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || res.statusText };
        }
        console.error('[KitchenPanel] Failed to update order status:', res.status, res.statusText, errorData);
        setFetchError(`Failed to update order status: ${res.status} ${res.statusText}`);
        return;
      }

      const data = await res.json();
      console.log('[KitchenPanel] Status update response:', data);
      
      // Clear error on success
      if (data.success) {
        setFetchError(null);
      }
      
      // Refresh orders after status update
      fetchOrders();
    } catch (e) {
      if (e instanceof TypeError && e.message === 'Failed to fetch') {
        console.error('[KitchenPanel] Network error updating order status');
        setFetchError('Unable to connect to server. Please check your connection.');
      } else {
        console.error('[KitchenPanel] Error updating order status:', e);
        setFetchError('An error occurred while updating order status.');
      }
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpanded(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  return (
    <>
      <InstallPrompt />
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-4xl font-bold mb-8 text-gradient">Kitchen Display - SmashDaddy</h1>
      
      {/* Error Alert */}
      {fetchError && (
        <div className="bg-yellow-600 text-white px-6 py-4 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold">Connection Issue</p>
              <p className="text-sm text-yellow-100">{fetchError}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setFetchError(null);
              fetchOrders();
            }}
            className="px-4 py-2 bg-yellow-700 hover:bg-yellow-800 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="text-center text-lg">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-lg">
          No active kitchen orders.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => {
            const seconds = getTimeDiff(order.createdAt);
            const isLate = seconds > 15 * 60; // 15 minutes
            const isExpanded = expanded[order.id];
            return (
              <div
                key={order.id}
                className={`bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col justify-between min-h-[320px] transition-all duration-300 ${isLate ? 'border-4 border-red-500 bg-red-900/30' : ''} cursor-pointer`}
                onClick={() => toggleExpand(order.id)}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xl font-bold">{order.orderNumber}</span>
                    <span className={`text-sm font-mono ${isLate ? 'text-red-400 font-bold animate-pulse' : 'text-gray-400'}`}>{formatTimeSince(seconds)}</span>
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-semibold">Customer:</span> {order.customerName}
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${order.orderType === 'TAKEAWAY' ? 'bg-blue-700 text-blue-200' : order.orderType === 'DELIVERY' ? 'bg-green-700 text-green-200' : order.orderType === 'COLLECTION' ? 'bg-yellow-700 text-yellow-200' : 'bg-gray-700 text-gray-200'}`}>{order.orderType}</span>
                  </div>
                  <div className="mb-4">
                    <span className="font-semibold">Status:</span> <span className="uppercase tracking-wider text-yellow-400">{order.status}</span>
                  </div>
                  <div className="mb-4">
                    <span className="font-semibold">Items:</span>
                    <ul className="ml-4 mt-1 list-disc">
                      {order.items.map(item => (
                        <li key={item.id} className="text-lg flex items-center gap-2">
                          <span className="font-bold">{item.quantity}x</span> {item.name}
                          {item.isSpicy && <Flame className="inline w-4 h-4 text-red-500" />}
                          {item.isVegetarian && <Leaf className="inline w-4 h-4 text-green-400" />}
                          {item.allergens && <span className="ml-1 text-xs text-yellow-300" title={`Allergens: ${item.allergens}`}>⚠️</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {order.specialInstructions && (
                    <div className="mb-4 p-2 bg-yellow-900/40 rounded">
                      <span className="font-semibold text-yellow-300">Special:</span> {order.specialInstructions}
                    </div>
                  )}
                  {isExpanded && (
                    <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="mb-2">
                        <span className="font-semibold">Order Details:</span>
                        <ul className="ml-4 mt-1 list-disc text-sm">
                          {order.items.map(item => (
                            <li key={item.id}>
                              <span className="font-bold">{item.quantity}x</span> {item.name}
                              {item.isSpicy && <Flame className="inline w-3 h-3 text-red-500 ml-1" />}
                              {item.isVegetarian && <Leaf className="inline w-3 h-3 text-green-400 ml-1" />}
                              {item.allergens && <span className="ml-1 text-xs text-yellow-300" title={`Allergens: ${item.allergens}`}>⚠️ {item.allergens}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Placeholder for more details: customer notes, etc. */}
                      <div className="text-xs text-gray-400">Click card to collapse</div>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  {order.status === 'PENDING' && (
                    <Button
                      variant="primary"
                      className="w-full text-lg py-3"
                      onClick={() => {
                        // Use a wrapper to access event
                        const handler = (e: React.MouseEvent) => {
                          e.stopPropagation();
                          updateOrderStatus(order.id, 'preparing');
                        };
                        // Simulate click event for Button signature
                        handler({ stopPropagation: () => {} } as React.MouseEvent);
                      }}
                    >
                      👨‍🍳 Start Preparing
                    </Button>
                  )}
                  {order.status === 'PREPARING' && (
                    <Button
                      variant="primary"
                      className="w-full text-lg py-3"
                      onClick={() => {
                        const handler = (e: React.MouseEvent) => {
                          e.stopPropagation();
                          updateOrderStatus(order.id, 'ready_for_pickup');
                        };
                        handler({ stopPropagation: () => {} } as React.MouseEvent);
                      }}
                    >
                      ✅ Mark Ready
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </>
  );
} 