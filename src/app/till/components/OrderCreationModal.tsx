'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// Types for menu items
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: {
    name: string;
  };
  isAvailable: boolean;
}

interface OrderCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: {
    id: string;
    orderNumber: string;
    customerName: string;
    items: Array<{
      id: string;
      menuItemName: string;
      quantity: number;
      totalPrice: number;
    }>;
    total: number;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    orderType: string;
    createdAt: string;
  }) => void;
}

export default function OrderCreationModal({ isOpen, onClose, onOrderCreated }: OrderCreationModalProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<Array<{item: MenuItem, quantity: number}>>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<'collection' | 'delivery' | 'takeaway'>('collection');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [isCreating, setIsCreating] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch menu items from API
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/menu');
      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }
      
      const data = await response.json();
      if (data.success) {
        setMenuItems(data.menuItems);
      } else {
        throw new Error(data.error || 'Failed to fetch menu items');
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMenuItems();
    }
  }, [isOpen]);

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category.name)))];

  const filteredItems = menuItems.filter(item => 
    selectedCategory === 'All' || item.category.name === selectedCategory
  );

  const addToCart = (item: MenuItem) => {
    if (!item.isAvailable) return;
    
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.item.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { item, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prevCart => prevCart.filter(cartItem => cartItem.item.id !== itemId));
    } else {
      setCart(prevCart =>
        prevCart.map(cartItem =>
          cartItem.item.id === itemId
            ? { ...cartItem, quantity }
            : cartItem
        )
      );
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(cartItem => cartItem.item.id !== itemId));
  };

  const getSubtotal = () => {
    return cart.reduce((sum, cartItem) => sum + (cartItem.item.price * cartItem.quantity), 0);
  };

  const getDeliveryFee = () => {
    return orderType === 'delivery' ? 2.50 : 0;
  };

  const getTotal = () => {
    return getSubtotal() + getDeliveryFee();
  };

  const handleCreateOrder = async () => {
    if (!customerName.trim()) {
      setError('Please enter customer name');
      return;
    }

    if (cart.length === 0) {
      setError('Please add items to the order');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Create order via API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerDetails: {
            name: customerName,
            phone: customerPhone,
            email: '', // Optional for till orders
          },
          orderType,
          paymentMethod,
          items: cart.map(cartItem => ({
            menuItemId: cartItem.item.id,
            quantity: cartItem.quantity,
            unitPrice: cartItem.item.price,
            totalPrice: cartItem.item.price * cartItem.quantity,
            menuItemName: cartItem.item.name,
          })),
          subtotal: getSubtotal(),
          deliveryFee: getDeliveryFee(),
          total: getTotal(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const result = await response.json();
      if (result.success) {
        onOrderCreated(result.order);
        onClose();
        // Reset form
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setOrderType('collection');
        setPaymentMethod('card');
        setError(null);
      } else {
        throw new Error(result.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error instanceof Error ? error.message : 'Failed to create order. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-6xl h-[90vh] flex flex-col min-h-0">
        <Card className="card h-full flex flex-col min-h-0" contentClassName="overflow-y-auto p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Create New Order</h2>
            <Button
              onClick={onClose}
              variant="outline"
              className="border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
            >
              ✕
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
              <Button 
                onClick={() => setError(null)}
                className="mt-2 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400"
              >
                Dismiss
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left Side - Menu Items */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Menu Items</h3>
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={selectedCategory === category ? 
                        'bg-yellow-500 hover:bg-yellow-600 text-black font-semibold' : 
                        'border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700'
                      }
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {/* Menu Items Grid */}
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading menu items...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {filteredItems.map(item => (
                      <div
                        key={item.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                          item.isAvailable 
                            ? 'border-gray-600 hover:border-yellow-500 bg-gray-800' 
                            : 'border-gray-700 bg-gray-900 opacity-50 cursor-not-allowed'
                        }`}
                        onClick={() => addToCart(item)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-white">{item.name}</h4>
                          <span className="text-yellow-400 font-semibold">£{item.price.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{item.description}</p>
                        <div className="flex justify-between items-center">
                          <Badge className="bg-gray-700 text-gray-300 text-xs">
                            {item.category.name}
                          </Badge>
                          {!item.isAvailable && (
                            <Badge className="bg-red-500 text-white text-xs">
                              Unavailable
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredItems.length === 0 && !loading && (
                  <div className="text-center py-8 text-gray-400">
                    <p>No items found in this category</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Order Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Order Details</h3>
                
                {/* Customer Information */}
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                      placeholder="Enter customer name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                {/* Order Type & Payment Method */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Order Type</label>
                    <select
                      value={orderType}
                      onChange={(e) => setOrderType(e.target.value as 'collection' | 'delivery' | 'takeaway')}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                    >
                      <option value="collection">Collection</option>
                      <option value="delivery">Delivery</option>
                      <option value="takeaway">Takeaway</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'cash')}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                    >
                      <option value="card">Card</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>
                </div>

                {/* Cart Items */}
                <div>
                  <h4 className="text-md font-semibold text-white mb-2">Order Items</h4>
                  {cart.length === 0 ? (
                    <p className="text-gray-400 text-sm">No items added to order</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {cart.map((cartItem, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-800 rounded-lg">
                          <div className="flex-1">
                            <p className="text-white font-medium">{cartItem.item.name}</p>
                            <p className="text-sm text-gray-400">£{cartItem.item.price.toFixed(2)} each</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                              className="w-6 h-6 p-0 bg-gray-700 hover:bg-gray-600 text-white"
                            >
                              -
                            </Button>
                            <span className="text-white font-medium min-w-[2rem] text-center">
                              {cartItem.quantity}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                              className="w-6 h-6 p-0 bg-gray-700 hover:bg-gray-600 text-white"
                            >
                              +
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => removeFromCart(cartItem.item.id)}
                              className="w-6 h-6 p-0 bg-red-600 hover:bg-red-700 text-white"
                            >
                              ✕
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal:</span>
                      <span className="text-white">£{getSubtotal().toFixed(2)}</span>
                    </div>
                    {orderType === 'delivery' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Delivery Fee:</span>
                        <span className="text-white">£{getDeliveryFee().toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t border-gray-700 pt-2">
                      <span className="text-white">Total:</span>
                      <span className="text-yellow-400">£{getTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Create Order Button */}
                <Button
                  onClick={handleCreateOrder}
                  disabled={isCreating || cart.length === 0 || !customerName.trim()}
                  className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating Order...' : 'Create Order'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
