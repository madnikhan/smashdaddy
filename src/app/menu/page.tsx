"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { 
  Plus, 
  Minus, 
  ShoppingCart,
  Clock,
  Flame,
  Leaf,
  Star,
  Menu,
  X,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  ArrowRight,
  History,
  RefreshCw,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { Input } from "@/components/ui/Input";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: {
    id: string;
    name: string;
  };
  isAvailable: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isSpicy?: boolean;
  allergens?: string;
  preparationTime?: number;
  image?: string; // Added for image URL
  mealDeal?: boolean; // Added for meal deal
  kidsMeal?: boolean; // Added for kids meal
  customizations?: Array<{ // Added for customizations
    id: string;
    name: string;
    options: Array<{
      id: string;
      name: string;
      price: number;
    }>;
  }>;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

interface OrderHistoryItem {
  id: string;
  orderNumber: string;
  orderDate: string;
  orderType: string;
  total: number;
  status: string;
  itemCount: number;
  items: Array<{
    name: string;
    quantity: number;
    totalPrice: number;
  }>;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    postcode?: string;
  };
}

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyIdentifier, setHistoryIdentifier] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { cart, loading: cartLoading, error: cartError, addToCart, updateCartItem, removeFromCart, updateCart } = useCart();

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
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
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch menu items');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  // Group menu items by category
  const menuCategories: MenuCategory[] = React.useMemo(() => {
    const categories = new Map<string, MenuCategory>();
    
    menuItems.forEach(item => {
      if (!categories.has(item.category.id)) {
        categories.set(item.category.id, {
          id: item.category.id,
          name: item.category.name,
          items: []
        });
      }
      categories.get(item.category.id)!.items.push(item);
    });

    return Array.from(categories.values()).sort((a, b) => {
      // Sort categories by a predefined order
      const order = ['grilled-chicken', 'burgers', 'wraps', 'rice-boxes', 'kids-meals', 'sides', 'drinks', 'meal-deals'];
      const aIndex = order.indexOf(a.id);
      const bIndex = order.indexOf(b.id);
      return aIndex - bIndex;
    });
  }, [menuItems]);

  const getCartItemQuantity = (menuItemId: string) => {
    const cartItem = cart.items.find(item => item.menuItemId === menuItemId);
    return cartItem?.quantity || 0;
  };

  const handleAddToCart = async (menuItemId: string) => {
    await addToCart(menuItemId, 1);
  };

  const handleRemoveFromCart = async (menuItemId: string) => {
    const cartItem = cart.items.find(item => item.menuItemId === menuItemId);
    if (cartItem) {
      await removeFromCart(cartItem.id);
    }
  };

  // Helper to get sessionId (same as CartContext)
  const getSessionId = () => {
    if (typeof window === 'undefined') return '';
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
  };

  // Fetch order history
  const fetchOrderHistory = async (identifier: string) => {
    setLoadingHistory(true);
    try {
      const isEmail = identifier.includes('@');
      const url = isEmail 
        ? `/api/orders/history?email=${encodeURIComponent(identifier)}`
        : `/api/orders/history?phone=${encodeURIComponent(identifier)}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setOrderHistory(data.orders);
        setShowOrderHistory(true);
      } else {
        setOrderHistory([]);
        setShowOrderHistory(true);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
      setOrderHistory([]);
      setShowOrderHistory(true);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Handle reorder
  const handleReorder = async (orderId: string) => {
    try {
      const sessionId = getSessionId();
      const response = await fetch('/api/orders/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          sessionId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        updateCart(data.cart);
        setShowOrderHistory(false); // Close the reorder section after successful reorder
        // Success - items added to cart silently
      } else {
        throw new Error('Failed to reorder');
      }
    } catch (error) {
      console.error('Error processing reorder:', error);
      alert('Failed to add items to cart. Please try again.');
    }
  };

  const filteredCategories = selectedCategory === "all" 
    ? menuCategories 
    : menuCategories.filter(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-bold text-gradient cursor-pointer">
                  SmashDaddy
                </h1>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/menu" className="nav-link-active">
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
              <Link href="/order" className="nav-link-inactive">
                Order Now
              </Link>
            </div>
            
            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/order">
                <Button variant="primary" size="sm">
                  Order Now
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
                  className="block px-3 py-2 text-secondary transition-colors"
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
                  className="block px-3 py-2 text-text hover:text-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Order Now
                </Link>
                <div className="pt-4 pb-2 border-t border-border">
                  <Link 
                    href="/order"
                    className="block px-3 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="primary" size="sm" className="w-full">
                      Order Now
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
              SmashDaddy <span className="text-gradient">Menu</span>
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Premium smashed burgers, grilled chicken, and wings. Fresh ingredients, bold flavours.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-secondary text-primary"
                  : "bg-tertiary text-text hover:bg-secondary/20"
              }`}
            >
              All Menu
            </button>
            {menuCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-secondary text-primary"
                    : "bg-tertiary text-text hover:bg-secondary/20"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Reorder Button */}
        <div className="mb-8 text-center">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setShowOrderHistory(!showOrderHistory)}
            className="flex items-center mx-auto"
          >
            <History className="h-5 w-5 mr-2" />
            {showOrderHistory ? 'Hide Previous Orders' : 'Reorder Previous Orders'}
          </Button>
        </div>

        {/* Collapsible Order History Section */}
        {showOrderHistory && (
          <div className="mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  Previous Orders
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOrderHistory(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Search Input */}
                <div className="flex gap-2">
                  <Input
                    value={historyIdentifier}
                    onChange={(value) => setHistoryIdentifier(value)}
                    placeholder="Enter your email or phone number"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fetchOrderHistory(historyIdentifier)}
                    disabled={!historyIdentifier.trim() || loadingHistory}
                  >
                    {loadingHistory ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Order History Results */}
                {orderHistory.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {orderHistory.map((order) => (
                      <div key={order.id} className="border border-border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-text">Order #{order.orderNumber}</h4>
                            <p className="text-sm text-text-secondary">
                              {new Date(order.orderDate).toLocaleDateString('en-GB')} • {order.orderType}
                            </p>
                          </div>
                          <Badge variant={order.status === 'DELIVERED' ? 'success' : 'warning'}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-text-secondary mb-2">
                          {order.itemCount} items • {formatPrice(order.total)}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleReorder(order.id)}
                          >
                            Reorder
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : orderHistory.length === 0 && historyIdentifier ? (
                  <div className="text-center py-4">
                    <p className="text-text-secondary">No previous orders found</p>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <History className="h-12 w-12 text-text-secondary mx-auto mb-3" />
                    <p className="text-text-secondary mb-4">
                      Enter your email or phone number to find your previous orders
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Menu Items */}
        <div className="space-y-12">
          {filteredCategories.map((category) => (
            <div key={category.id} className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-text mb-2">
                  {category.name}
                </h2>
              </div>
              {/* Grid of cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.items.map((item) => {
                  const cartQuantity = getCartItemQuantity(item.id);
                  return (
                    <Card key={item.id} className="hover-lift overflow-hidden flex flex-col h-full">
                      {/* Image (if available) */}
                      {item.image && (
                        <div className="h-40 w-full bg-tertiary flex items-center justify-center overflow-hidden">
                          <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-1">
                        {/* Item Header */}
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-text mb-1">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-text-secondary text-sm mb-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-2xl font-bold text-gradient">
                            {formatPrice(item.price)}
                          </div>
                          {item.preparationTime && (
                            <div className="flex items-center text-text-secondary text-sm mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {item.preparationTime}min
                            </div>
                          )}
                        </div>
                        {/* Dietary Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {item.isVegetarian && (
                            <Badge variant="secondary" className="text-xs">
                              <Leaf className="h-3 w-3 mr-1" />
                              Vegetarian
                            </Badge>
                          )}
                          {item.isVegan && (
                            <Badge variant="secondary" className="text-xs">
                              <Leaf className="h-3 w-3 mr-1" />
                              Vegan
                            </Badge>
                          )}
                          {item.isSpicy && (
                            <Badge variant="error" className="text-xs">
                              <Flame className="h-3 w-3 mr-1" />
                              Spicy
                            </Badge>
                          )}
                          {item.mealDeal && (
                            <Badge variant="primary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Meal Deal
                            </Badge>
                          )}
                          {item.kidsMeal && (
                            <Badge variant="warning" className="text-xs">
                              Kids Meal
                            </Badge>
                          )}
                        </div>
                        {/* Customizations */}
                        {item.customizations && item.customizations.length > 0 && (
                          <div className="mb-4">
                            <p className="text-text-secondary text-sm mb-2">
                              Choose your options:
                            </p>
                            {item.customizations.map((customization) => (
                              <div key={customization.id} className="text-sm mb-1">
                                <span className="text-text-secondary">
                                  {customization.name}:
                                </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {customization.options.map((option) => (
                                    <span
                                      key={option.id}
                                      className="px-2 py-1 bg-tertiary rounded text-xs text-text-secondary"
                                    >
                                      {option.name}
                                      {option.price > 0 && ` (+${formatPrice(option.price)})`}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Add to Cart */}
                        <div className="flex items-center justify-between mt-auto pt-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="p-1 rounded-full bg-tertiary hover:bg-secondary/20 transition-colors disabled:opacity-50"
                              disabled={cartQuantity === 0 || loading}
                            >
                              <Minus className="h-4 w-4 text-text" />
                            </button>
                            <span className="text-text font-medium min-w-[2rem] text-center">
                              {cartQuantity}
                            </span>
                            <button
                              onClick={() => handleAddToCart(item.id)}
                              className="p-1 rounded-full bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
                              disabled={loading}
                            >
                              <Plus className="h-4 w-4 text-primary" />
                            </button>
                          </div>
                          <Button
                            onClick={() => handleAddToCart(item.id)}
                            variant="primary"
                            size="sm"
                            className="flex items-center"
                            disabled={loading}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">Ready to Order?</h2>
          <p className="text-xl text-primary/80 mb-8">Add items to your cart and checkout with our secure SumUp payment system.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order">
              <Button variant="primary" size="lg" className="text-lg px-8 py-4">
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-primary text-primary hover:bg-primary hover:text-secondary">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-gradient mb-4">SmashDaddy</h3>
              <p className="text-text-secondary">Premium smashed burgers, grilled chicken, and wings in Daventry. Fresh ingredients, bold flavours.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-text mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/menu" className="text-text-secondary hover:text-text">Menu</Link></li>
                <li><Link href="/order" className="text-text-secondary hover:text-text">Order Online</Link></li>
                <li><Link href="/about" className="text-text-secondary hover:text-text">About Us</Link></li>
                <li><Link href="/contact" className="text-text-secondary hover:text-text">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-text mb-4">Order Types</h4>
              <ul className="space-y-2">
                <li><Link href="/order?type=delivery" className="text-text-secondary hover:text-text">Delivery</Link></li>
                <li><Link href="/order?type=collection" className="text-text-secondary hover:text-text">Collection</Link></li>
                <li><Link href="/order?type=takeaway" className="text-text-secondary hover:text-text">Takeaway</Link></li>
                <li><Link href="/opening-hours" className="text-text-secondary hover:text-text">Opening Hours</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-text mb-4">Contact</h4>
              <div className="space-y-2 text-text-secondary">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>St John&apos;s Square, Daventry NN11 4HY</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>+44 (0) 1327 123 4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>hello@stackd-daventry.co.uk</span>
                </div>
              </div>
              <div className="flex space-x-4 mt-4">
                <Link href="#" className="text-text-secondary hover:text-secondary">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-text-secondary hover:text-secondary">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-text-secondary hover:text-secondary">
                  <Instagram className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-text-secondary">
            <p>© 2024 SmashDaddy. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating Cart Button */}
      {cart.itemCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            variant="primary"
            size="lg"
            className="rounded-full shadow-lg"
            onClick={() => setCartDrawerOpen(true)}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Cart ({cart.itemCount}) - {formatPrice(cart.total)}
          </Button>
        </div>
      )}

      {/* Cart Drawer */}
      {cartDrawerOpen && (
        <CartDrawer 
          isOpen={cartDrawerOpen} 
          onClose={() => setCartDrawerOpen(false)} 
        />
      )}
    </div>
  );
}

// Cart Drawer Component
function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cart, loading, updateCartItem, removeFromCart } = useCart();

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await updateCartItem(itemId, newQuantity);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-black border-l border-border transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-bold text-text">Your Cart</h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cart.items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                <p className="text-text-secondary">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-tertiary rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-text">{item.menuItem.name}</h3>
                      <p className="text-sm text-text-secondary">{formatPrice(item.unitPrice)} each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                        disabled={loading}
                      >
                        <Minus className="h-4 w-4 text-primary" />
                      </button>
                      <span className="text-text font-medium min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                        disabled={loading}
                      >
                        <Plus className="h-4 w-4 text-primary" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-text">{formatPrice(item.totalPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.items.length > 0 && (
            <div className="p-6 border-t border-border">
              <div className="flex justify-between items-center mb-4">
                <span className="text-text font-semibold">Total:</span>
                <span className="text-2xl font-bold text-gradient">{formatPrice(cart.total)}</span>
              </div>
              <Link href="/order" onClick={onClose}>
                <Button variant="primary" className="w-full" size="lg">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 