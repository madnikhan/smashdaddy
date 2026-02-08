'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import LiveMap from '@/components/LiveMap';
import {
  Package,
  MapPin,
  Clock,
  Phone,
  Truck,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Navigation,
  AlertCircle,
  Star,
} from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface DriverLocation {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  timestamp: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleInfo: any;
  isAvailable: boolean;
  location: DriverLocation | null;
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
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  driver: Driver | null;
}

function getStatusColor(status: string) {
  const statusUpper = status.toUpperCase();
  switch (statusUpper) {
    case 'PENDING':
      return 'bg-yellow-500 text-yellow-900';
    case 'CONFIRMED':
      return 'bg-blue-500 text-blue-900';
    case 'PREPARING':
      return 'bg-orange-500 text-orange-900';
    case 'READY_FOR_PICKUP':
      return 'bg-purple-500 text-purple-900';
    case 'OUT_FOR_DELIVERY':
      return 'bg-indigo-500 text-indigo-900';
    case 'DELIVERED':
      return 'bg-green-500 text-green-900';
    case 'CANCELLED':
      return 'bg-red-500 text-red-900';
    default:
      return 'bg-gray-500 text-gray-900';
  }
}

function getStatusMessage(status: string, orderType: string) {
  const statusUpper = status.toUpperCase();
  switch (statusUpper) {
    case 'PENDING':
      return 'Your order has been received and is being confirmed.';
    case 'CONFIRMED':
      return 'Your order has been confirmed and will be prepared soon.';
    case 'PREPARING':
      return 'Your order is being prepared in the kitchen.';
    case 'READY_FOR_PICKUP':
      return orderType === 'DELIVERY' 
        ? 'Your order is ready and waiting for a driver.' 
        : 'Your order is ready for pickup!';
    case 'OUT_FOR_DELIVERY':
      return 'Your order is on the way! Track the driver below.';
    case 'DELIVERED':
      return 'Your order has been delivered. Enjoy your meal!';
    case 'CANCELLED':
      return 'Your order has been cancelled.';
    default:
      return 'Your order status is being updated.';
  }
}

export default function TrackOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params?.orderNumber as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [existingRating, setExistingRating] = useState<{ rating: number; comment?: string } | null>(null);
  const orderRef = useRef<Order | null>(null);
  
  // Update ref when order changes
  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  const fetchOrderDetails = useCallback(async () => {
    // Validate orderNumber before making request
    if (!orderNumber || typeof orderNumber !== 'string' || orderNumber.trim() === '') {
      setError('Invalid order number. Please check your order number and try again.');
      setLoading(false);
      return;
    }

    try {
      const url = `/api/orders/track/${encodeURIComponent(orderNumber.trim())}`;
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      let response: Response | null = null;
      try {
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        // Check if it's an abort error (timeout)
        if (fetchError.name === 'AbortError' || fetchError.name === 'TimeoutError') {
          // Don't set error for timeout during polling - just skip this update
          if (orderRef.current) {
            return; // If we already have order data, don't show timeout error
          }
          setError('Request timed out. Please try again.');
          setLoading(false);
          return;
        }
        
        // Network error - check if server is reachable
        if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
          // Don't show error during polling if we already have order data
          if (orderRef.current) {
            return; // Silently skip this update
          }
          setError('Unable to connect to server. Please check your internet connection and ensure the server is running.');
          setLoading(false);
          return;
        }
        
        // Other errors
        setError('An error occurred while fetching order details. Please try again.');
        setLoading(false);
        return;
      }
      
      if (!response) {
        return; // Already handled in catch block
      }

      if (!response.ok) {
        // Check content type before parsing
        const contentType = response.headers.get('content-type');
        let errorData: any = { error: response.statusText };
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorText = await response.text();
            errorData = JSON.parse(errorText);
          } catch (parseError) {
            console.error('[TrackOrder] Error parsing error response:', parseError);
          }
        } else {
          const errorText = await response.text();
          errorData = { error: errorText || response.statusText };
        }
        
        if (response.status === 404) {
          setError('Order not found. Please check your order number.');
        } else {
          setError(`Failed to load order: ${errorData.error || response.statusText}`);
        }
        setLoading(false);
        return;
      }

      // Check content type before parsing JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('[TrackOrder] Expected JSON but got:', contentType, text.substring(0, 200));
        setError('Server returned invalid response. Please try again.');
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setOrder(data.order);
        setError(null);
        setLastUpdated(new Date());
        
        // Fetch existing rating if order is delivered and has a driver
        if (data.order.status === 'DELIVERED' && data.order.driver) {
          fetchExistingRating(data.order.id, data.order.driver.id);
        }
      } else {
        setError(data.error || 'Failed to load order details');
      }
    } catch (e) {
      // Only show error if we don't already have order data (to avoid disrupting user experience during polling)
      if (!orderRef.current) {
        if (e instanceof TypeError && e.message === 'Failed to fetch') {
          setError('Unable to connect to server. Please check your internet connection and ensure the server is running.');
        } else if (e instanceof Error && e.message.includes('timeout')) {
          setError('Request timed out. Please try again.');
        } else {
          setError('An error occurred while fetching order details. Please try again.');
        }
      }
      // Silently log errors during polling (we already have order data)
      if (!orderRef.current) {
        console.error('[TrackOrder] Error fetching order:', e);
      }
    } finally {
      // Only set loading to false on initial load, not during polling
      if (!orderRef.current) {
        setLoading(false);
      }
    }
  }, [orderNumber]);

  useEffect(() => {
    if (!orderNumber) {
      setError('Order number is required');
      setLoading(false);
      return;
    }

    fetchOrderDetails();
    
    // Poll for updates every 30 seconds (reduced frequency to avoid excessive requests)
    const interval = setInterval(() => {
      fetchOrderDetails();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [orderNumber, fetchOrderDetails]);

  const fetchExistingRating = async (orderId: string, driverId: string) => {
    try {
      const response = await fetch(`/api/drivers/${driverId}/rating?orderId=${orderId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.rating) {
          setExistingRating({ rating: data.rating.rating, comment: data.rating.comment || undefined });
          setRating(data.rating.rating);
          setComment(data.rating.comment || '');
          setRatingSubmitted(true);
        }
      }
    } catch (error) {
      console.error('Error fetching existing rating:', error);
    }
  };

  const handleSubmitRating = async () => {
    if (!order || !order.driver || rating === 0) {
      console.error('Cannot submit rating:', { hasOrder: !!order, hasDriver: !!order?.driver, rating });
      return;
    }

    setIsSubmittingRating(true);

    const ratingData = {
      orderId: order.id,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      rating: Number(rating), // Ensure it's a number
      comment: comment.trim() || null,
    };

    console.log('Submitting rating:', ratingData);
    console.log('Driver ID:', order.driver.id);

    try {
      const response = await fetch(`/api/drivers/${order.driver.id}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData: any = {};
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || response.statusText };
        }
        console.error('Rating submission error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          errorText,
        });
        
        // Build a detailed error message
        let errorMessage = errorData.error || 'Failed to submit rating';
        if (errorData.message && errorData.message !== errorMessage) {
          errorMessage += `: ${errorData.message}`;
        }
        if (errorData.code && errorData.code !== 'UNKNOWN') {
          errorMessage += ` (Code: ${errorData.code})`;
        }
        if (errorData.details) {
          errorMessage += ` - ${errorData.details}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.success) {
        setRatingSubmitted(true);
        setExistingRating({ rating, comment: comment.trim() || undefined });
        alert('Thank you for rating the driver!');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Full error details:', error);
      alert(`Failed to submit rating: ${errorMessage}\n\nPlease check the console for more details.`);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const getDirections = () => {
    if (!order?.customerAddress) return;
    const encodedAddress = encodeURIComponent(
      `${order.customerAddress}, ${order.customerCity} ${order.customerPostcode}`
    );
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-secondary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text mb-2">Order Not Found</h1>
          <p className="text-text-secondary mb-6">{error || 'Unable to load order details.'}</p>
          <div className="space-y-3">
            <Link href="/">
              <Button variant="primary" className="w-full">
                Back to Home
              </Button>
            </Link>
            <Link href="/menu">
              <Button variant="outline" className="w-full">
                Browse Menu
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const showDriverTracking = order.driver?.location && 
    (order.status === 'OUT_FOR_DELIVERY' || order.status === 'READY_FOR_PICKUP');

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-2xl font-bold text-gradient mb-2 inline-block">
                SmashDaddy
              </Link>
              <h1 className="text-3xl font-bold text-text">Track Your Order</h1>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-text">Order #{order.orderNumber}</h2>
                  <p className="text-text-secondary text-sm mt-1">
                    Placed on {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>

              <div className="bg-secondary/10 p-4 rounded-lg mb-4">
                <p className="text-text font-medium">{getStatusMessage(order.status, order.orderType)}</p>
              </div>

              {/* Driver Info */}
              {order.driver && (
                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Truck className="h-5 w-5 text-secondary" />
                    <h3 className="font-semibold text-text">Driver Assigned</h3>
                  </div>
                  <div className="pl-8 space-y-1">
                    <p className="text-text-secondary">Driver: {order.driver.name}</p>
                    <p className="text-text-secondary">Phone: {order.driver.phone}</p>
                    {order.driver.vehicleInfo && (
                      <p className="text-text-secondary">
                        Vehicle: {typeof order.driver.vehicleInfo === 'object' 
                          ? JSON.stringify(order.driver.vehicleInfo) 
                          : order.driver.vehicleInfo}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              {order.orderType === 'DELIVERY' && (
                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="h-5 w-5 text-secondary" />
                        <h3 className="font-semibold text-text">Delivery Address</h3>
                      </div>
                      <p className="text-text-secondary pl-7">
                        {order.customerAddress}<br />
                        {order.customerCity} {order.customerPostcode}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={getDirections}>
                      <Navigation className="h-4 w-4 mr-2" />
                      Directions
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Order Items */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-text mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Order Items
              </h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-border/20 last:border-b-0">
                    <div>
                      <p className="font-semibold text-text">{item.name}</p>
                      <p className="text-sm text-text-secondary">
                        {item.quantity} × £{item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold text-text">£{item.totalPrice.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal</span>
                    <span>£{order.subtotal.toFixed(2)}</span>
                  </div>
                  {order.deliveryFee > 0 && (
                    <div className="flex justify-between text-text-secondary">
                      <span>Delivery Fee</span>
                      <span>£{order.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-text-secondary">
                    <span>VAT (20%)</span>
                    <span>£{order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-text pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-gradient">£{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              {order.specialInstructions && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm font-semibold text-yellow-400 mb-1">Special Instructions</p>
                  <p className="text-sm text-text-secondary">{order.specialInstructions}</p>
                </div>
              )}
            </Card>

            {/* Rate Driver - Only show when order is delivered */}
            {order.status === 'DELIVERED' && order.driver && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-text mb-4 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-secondary" />
                  Rate Your Driver
                </h2>
                {ratingSubmitted && existingRating ? (
                  <div className="text-center py-4">
                    <div className="flex justify-center mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-8 w-8 ${
                            star <= existingRating.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-text font-semibold mb-2">Thank you for your rating!</p>
                    {existingRating.comment && (
                      <p className="text-text-secondary text-sm italic mb-4">"{existingRating.comment}"</p>
                    )}
                    <Button
                      onClick={() => {
                        setRating(existingRating.rating);
                        setComment(existingRating.comment || '');
                        setRatingSubmitted(false);
                      }}
                      variant="outline"
                      className="mt-4"
                    >
                      Update Rating
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-text-secondary mb-3">How was your delivery experience with {order.driver.name}?</p>
                      <div className="flex justify-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-10 w-10 transition-colors ${
                                star <= (hoveredRating || rating)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      {rating > 0 && (
                        <p className="text-center text-sm text-text-secondary mt-2">
                          {rating === 1 && 'Poor'}
                          {rating === 2 && 'Fair'}
                          {rating === 3 && 'Good'}
                          {rating === 4 && 'Very Good'}
                          {rating === 5 && 'Excellent'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="rating-comment" className="block text-sm font-medium text-text mb-2">
                        Optional Comment
                      </label>
                      <textarea
                        id="rating-comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience (optional)..."
                        className="w-full p-3 bg-tertiary border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                        rows={3}
                        maxLength={500}
                      />
                      <p className="text-xs text-text-secondary mt-1">{comment.length}/500 characters</p>
                    </div>
                    <Button
                      onClick={handleSubmitRating}
                      variant="primary"
                      className="w-full"
                      disabled={rating === 0 || isSubmittingRating}
                    >
                      {isSubmittingRating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Star className="h-4 w-4 mr-2" />
                          Submit Rating
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Driver Tracking */}
          <div className="space-y-6">
            {showDriverTracking ? (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-text mb-4 flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Live Driver Tracking
                </h2>
                <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                  <LiveMap
                    currentLocation={order.driver?.location ? {
                      latitude: order.driver.location.latitude,
                      longitude: order.driver.location.longitude,
                    } : null}
                    height="400px"
                    showControls={true}
                  />
                </div>
                {order.driver?.location && (
                  <div className="mt-4 text-sm text-text-secondary">
                    <p>Last updated: {new Date(order.driver.location.timestamp).toLocaleTimeString()}</p>
                    <p className="text-xs mt-1">Location updates automatically every 10 seconds</p>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-text mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Tracking Status
                </h2>
                <div className="text-center py-8">
                  {order.status === 'DELIVERED' ? (
                    <>
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <p className="text-text font-semibold mb-2">Order Delivered!</p>
                      <p className="text-text-secondary text-sm">
                        Your order has been successfully delivered.
                      </p>
                    </>
                  ) : order.driver ? (
                    <>
                      <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-text font-semibold mb-2">Driver Assigned</p>
                      <p className="text-text-secondary text-sm">
                        Live tracking will be available when your order is out for delivery.
                      </p>
                    </>
                  ) : (
                    <>
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-text font-semibold mb-2">Preparing Your Order</p>
                      <p className="text-text-secondary text-sm">
                        A driver will be assigned when your order is ready for delivery.
                      </p>
                    </>
                  )}
                </div>
              </Card>
            )}

            {/* Contact Info */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-text mb-4">Need Help?</h2>
              <div className="space-y-3">
                <a
                  href={`tel:${order.customerPhone}`}
                  className="flex items-center space-x-3 text-text-secondary hover:text-secondary transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  <span>Call Restaurant</span>
                </a>
                <p className="text-sm text-text-secondary">
                  If you have any questions about your order, please contact us.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-6 text-center text-sm text-text-secondary">
          <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
          <p className="text-xs mt-1">Page refreshes automatically every 10 seconds</p>
        </div>
      </div>
    </div>
  );
}

