'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Package, Search, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function TrackOrderEntryPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!orderNumber.trim()) {
      setError('Please enter your order number');
      return;
    }

    setIsLoading(true);

    try {
      // Validate order number format (e.g., ST-001)
      const trimmedOrderNumber = orderNumber.trim().toUpperCase();
      
      // Check if order exists
      const response = await fetch(`/api/orders/track/${trimmedOrderNumber}`);
      
      if (response.ok) {
        // Order exists, redirect to tracking page
        router.push(`/track/${trimmedOrderNumber}`);
      } else if (response.status === 404) {
        setError('Order not found. Please check your order number and try again.');
      } else {
        setError('Unable to find your order. Please try again later.');
      }
    } catch (error) {
      console.error('Error checking order:', error);
      setError('Unable to connect to server. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-6">
          <Package className="h-16 w-16 text-secondary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-text mb-2">Track Your Order</h1>
          <p className="text-text-secondary">
            Enter your order number to see real-time updates and delivery status
          </p>
        </div>

        <form onSubmit={handleTrackOrder} className="space-y-4">
          <div>
            <label htmlFor="orderNumber" className="block text-sm font-medium text-text mb-2">
              Order Number
            </label>
            <Input
              id="orderNumber"
              value={orderNumber}
              onChange={(value) => {
                setOrderNumber(value);
                setError(null);
              }}
              placeholder="e.g., ST-001"
              className="text-center text-lg font-mono"
              disabled={isLoading}
            />
            <p className="text-xs text-text-secondary mt-2">
              Your order number was sent to your email after placing the order
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isLoading || !orderNumber.trim()}
          >
            {isLoading ? (
              <>
                <Search className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Track Order
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="text-center space-y-3">
            <p className="text-sm text-text-secondary">
              Don't have your order number?
            </p>
            <div className="space-y-2">
              <Link href="/contact">
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

