"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";
import { 
  ShoppingCart,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  PoundSterling,
  Truck,
  Store,
  User,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";

type OrderType = 'delivery' | 'collection';
type PaymentMethod = 'card' | 'cash';

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postcode?: string;
  specialInstructions?: string;
}

export default function OrderPage() {
  const { cart, loading, clearCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Daventry',
    postcode: '',
    specialInstructions: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Debug cart state
  console.log('Order page - Cart state:', cart);
  console.log('Order page - Cart items length:', cart.items.length);
  console.log('Order page - Cart loading:', loading);

  // Calculate order totals
  const subtotal = cart.total;
  const deliveryFee = orderType === 'delivery' ? 2.99 : 0;
  const tax = subtotal * 0.20; // 20% VAT
  const total = subtotal + deliveryFee + tax;

  // Handle form input changes
  const handleInputChange = (field: keyof CustomerDetails, value: string) => {
    setCustomerDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle order type change
  const handleOrderTypeChange = (type: OrderType) => {
    setOrderType(type);
    // For delivery orders, force card payment
    if (type === 'delivery') {
      setPaymentMethod('card');
    }
  };

  // Validate form
  const isFormValid = () => {
    const requiredFields = ['name', 'email', 'phone'];
    const hasRequiredFields = requiredFields.every(field => 
      customerDetails[field as keyof CustomerDetails]?.trim()
    );
    
    if (orderType === 'delivery') {
      return hasRequiredFields && customerDetails.address?.trim() && customerDetails.postcode?.trim();
    }
    
    return hasRequiredFields;
  };

  // Handle order submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      alert('Please fill in all required fields');
      return;
    }

    // Check if cart has items
    if (cart.items.length === 0) {
      alert('Your cart is empty. Please add items from the menu first.');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting order with cart:', cart);
      console.log('Customer details:', customerDetails);
      
      const orderData = {
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
        customerAddress: customerDetails.address,
        customerCity: customerDetails.city,
        customerPostcode: customerDetails.postcode,
        orderType,
        items: cart.items.map(item => ({
          id: item.menuItemId,
          quantity: item.quantity,
          price: item.unitPrice,
          name: item.menuItem.name,
          description: item.menuItem.description || '',
        })),
        specialInstructions: customerDetails.specialInstructions,
        subtotal,
        tax,
        deliveryFee,
      };

      console.log('Order data being sent:', orderData);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to place order');
      }

      const result = await response.json();
      console.log('Success response:', result);
      setOrderNumber(result.order.orderNumber);
      setOrderSuccess(true);
      
      // Clear cart after successful order
      await clearCart();
      
    } catch (error) {
      console.error('Error placing order:', error);
      alert(`Failed to place order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if cart is empty
  useEffect(() => {
    console.log('Cart items length:', cart.items.length);
    console.log('Order success:', orderSuccess);
    console.log('Cart state:', cart);
    
    if (cart.items.length === 0 && !orderSuccess) {
      console.log('Redirecting to menu - cart is empty');
      // Redirect to menu if cart is empty
      window.location.href = '/menu';
    }
  }, [cart.items.length, orderSuccess]);

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text mb-2">Order Confirmed!</h1>
          <p className="text-text-secondary mb-4">
            Thank you for your order. We&apos;ll start preparing it right away.
          </p>
          <div className="bg-secondary/10 p-4 rounded-lg mb-6">
            <p className="text-sm text-text-secondary">Order Number</p>
            <p className="text-xl font-bold text-gradient">{orderNumber}</p>
          </div>
          <div className="space-y-3 text-sm text-text-secondary">
            <p>Estimated {orderType === 'delivery' ? 'delivery' : 'pickup'} time: 30-45 minutes</p>
            <p>We&apos;ll send updates to {customerDetails.email}</p>
          </div>
          <div className="mt-8 space-y-3">
            <Link href="/menu">
              <Button variant="primary" className="w-full">
                Order Again
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-bold text-gradient">
                  SmashDaddy
                </h1>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/menu" className="nav-link-inactive">
                Menu
              </Link>
              <Link href="/opening-hours" className="nav-link-inactive">
                Opening Hours
              </Link>
              <Link href="/about" className="nav-link-inactive">
                About
              </Link>
              <Link href="/contact" className="nav-link-inactive">
                Contact
              </Link>
              <Link href="/order" className="nav-link-active">
                Order Now
              </Link>
            </div>
            
            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/menu">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Menu
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-text hover:text-secondary transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-black/95 border-t border-border">
                <Link 
                  href="/menu" 
                  className="block px-3 py-2 text-text hover:text-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Menu
                </Link>
                <Link 
                  href="/opening-hours" 
                  className="block px-3 py-2 text-text hover:text-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Opening Hours
                </Link>
                <Link 
                  href="/about" 
                  className="block px-3 py-2 text-text hover:text-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  href="/contact" 
                  className="block px-3 py-2 text-text hover:text-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link 
                  href="/order" 
                  className="block px-3 py-2 text-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Order Now
                </Link>
                <div className="pt-4 pb-2 border-t border-border">
                  <Link 
                    href="/menu"
                    className="block px-3 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Menu
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Page Header */}
      <div className="pt-16 bg-black/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-text mb-4">
              Checkout
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Complete your order with secure payment and delivery options
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-text mb-4 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Order Summary
              </h2>
              
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-border/20 last:border-b-0">
                    <div className="flex-1">
                      <h3 className="font-semibold text-text">{item.menuItem.name}</h3>
                      <p className="text-sm text-text-secondary">
                        Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-text">{formatPrice(item.totalPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Subtotal</span>
                    <span className="text-text">{formatPrice(subtotal)}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Delivery Fee</span>
                      <span className="text-text">{formatPrice(deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-text-secondary">VAT (20%)</span>
                    <span className="text-text">{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                    <span className="text-text">Total</span>
                    <span className="text-gradient">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Checkout Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Order Type Selection */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-text mb-4">Order Type</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleOrderTypeChange('delivery')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      orderType === 'delivery'
                        ? 'border-secondary bg-secondary/10 text-secondary'
                        : 'border-border text-text-secondary hover:border-secondary/50'
                    }`}
                  >
                    <Truck className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Delivery</span>
                    <p className="text-xs mt-1">30-45 min • Card only</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOrderTypeChange('collection')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      orderType === 'collection'
                        ? 'border-secondary bg-secondary/10 text-secondary'
                        : 'border-border text-text-secondary hover:border-secondary/50'
                    }`}
                  >
                    <Store className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Collection</span>
                    <p className="text-xs mt-1">15-20 min • Cash/Card</p>
                  </button>
                </div>
              </Card>

              {/* Customer Details */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-text mb-4">Customer Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Full Name *
                    </label>
                    <Input
                      value={customerDetails.name}
                      onChange={(value) => handleInputChange('name', value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Phone Number *
                    </label>
                    <Input
                      value={customerDetails.phone}
                      onChange={(value) => handleInputChange('phone', value)}
                      placeholder="Enter your phone number"
                      type="tel"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-text mb-2">
                      Email Address *
                    </label>
                    <Input
                      value={customerDetails.email}
                      onChange={(value) => handleInputChange('email', value)}
                      placeholder="Enter your email address"
                      type="email"
                      required
                    />
                  </div>
                  
                  {orderType === 'delivery' && (
                    <>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-text mb-2">
                          Delivery Address *
                        </label>
                        <Input
                          value={customerDetails.address || ''}
                          onChange={(value) => handleInputChange('address', value)}
                          placeholder="Enter your delivery address"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          City
                        </label>
                        <Input
                          value={customerDetails.city || ''}
                          onChange={(value) => handleInputChange('city', value)}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Postcode *
                        </label>
                        <Input
                          value={customerDetails.postcode || ''}
                          onChange={(value) => handleInputChange('postcode', value)}
                          placeholder="Enter postcode"
                          required
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-text mb-2">
                      Special Instructions
                    </label>
                    <textarea
                      value={customerDetails.specialInstructions || ''}
                      onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                      placeholder="Any special requests or dietary requirements..."
                      className="w-full p-3 bg-tertiary border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-secondary"
                      rows={3}
                    />
                  </div>
                </div>
              </Card>

              {/* Payment Method */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-text mb-4">Payment Method</h2>
                <div className={`grid gap-3 ${orderType === 'delivery' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-secondary bg-secondary/10 text-secondary'
                        : 'border-border text-text-secondary hover:border-secondary/50'
                    }`}
                  >
                    <CreditCard className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">
                      {orderType === 'delivery' ? 'Card Payment (Required)' : 'Card Payment'}
                    </span>
                    <p className="text-xs mt-1">
                      {orderType === 'delivery' 
                        ? 'Secure online payment required for delivery' 
                        : 'Secure online payment or SumUp terminal'
                      }
                    </p>
                  </button>
                  {orderType !== 'delivery' && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        paymentMethod === 'cash'
                          ? 'border-secondary bg-secondary/10 text-secondary'
                          : 'border-border text-text-secondary hover:border-secondary/50'
                      }`}
                    >
                      <PoundSterling className="h-6 w-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">Cash Payment</span>
                      <p className="text-xs mt-1">Pay on {orderType === 'collection' ? 'collection' : 'pickup'}</p>
                    </button>
                  )}
                </div>
                {orderType === 'delivery' && (
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-400">
                      💳 Card payment is required for delivery orders for security and efficiency.
                    </p>
                  </div>
                )}
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full text-lg py-4"
                disabled={!isFormValid() || isSubmitting || loading}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing Order...
                  </>
                ) : (
                  <>
                    Place Order - {formatPrice(total)}
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/80 border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-gradient mb-4">SmashDaddy</h3>
              <p className="text-text-secondary mb-4 max-w-md">
                Daventry&apos;s finest smashed burgers and grilled chicken. Fresh ingredients, bold flavors, and exceptional service.
              </p>
              <div className="flex space-x-4">
                <a href="tel:+441327123456" className="text-text-secondary hover:text-secondary transition-colors">
                  <Phone className="h-5 w-5" />
                </a>
                <a href="mailto:info@stackd-daventry.co.uk" className="text-text-secondary hover:text-secondary transition-colors">
                  <Mail className="h-5 w-5" />
                </a>
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-secondary transition-colors">
                  <MapPin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-text mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/menu" className="text-text-secondary hover:text-secondary transition-colors">
                    Menu
                  </Link>
                </li>
                <li>
                  <Link href="/opening-hours" className="text-text-secondary hover:text-secondary transition-colors">
                    Opening Hours
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-text-secondary hover:text-secondary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-text-secondary hover:text-secondary transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Order Types */}
            <div>
              <h4 className="text-lg font-semibold text-text mb-4">Order Types</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/order?type=delivery" className="text-text-secondary hover:text-secondary transition-colors">
                    Delivery
                  </Link>
                </li>
                <li>
                  <Link href="/order?type=collection" className="text-text-secondary hover:text-secondary transition-colors">
                    Collection
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-text-secondary text-sm">
              © 2024 SmashDaddy. All rights reserved. | Daventry, Northamptonshire
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 