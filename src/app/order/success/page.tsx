"use client";

import React, { useEffect, useState, Suspense } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle, Clock, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      // Fetch order details
      fetchOrderDetails();
    }
  }, [orderNumber]);

  const fetchOrderDetails = async () => {
    try {
      // For now, we&apos;ll simulate order details
      // In production, you&apos;d fetch from the API
      setOrderDetails({
        orderNumber,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        orderType: 'delivery',
        total: 25.99,
        estimatedTime: '30-45 minutes',
      });
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text mb-2">Payment Successful!</h1>
        <p className="text-text-secondary mb-6">
          Your order has been confirmed and payment processed successfully.
        </p>

        <div className="bg-secondary/10 p-4 rounded-lg mb-6">
          <p className="text-sm text-text-secondary">Order Number</p>
          <p className="text-xl font-bold text-gradient">{orderNumber}</p>
        </div>

        <div className="space-y-4 text-left mb-6">
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-secondary" />
            <span className="text-text-secondary">
              Estimated {orderDetails?.orderType === 'delivery' ? 'delivery' : 'pickup'} time: {orderDetails?.estimatedTime}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-2 text-secondary" />
            <span className="text-text-secondary">
              Confirmation sent to {orderDetails?.customerEmail}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 mr-2 text-secondary" />
            <span className="text-text-secondary">
              We&apos;ll call if there are any issues
            </span>
          </div>
        </div>

        <div className="space-y-3">
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

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
} 