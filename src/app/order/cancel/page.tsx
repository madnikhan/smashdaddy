"use client";

import React, { Suspense } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function OrderCancelContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text mb-2">Payment Cancelled</h1>
        <p className="text-text-secondary mb-6">
          Your payment was cancelled. No charges have been made to your account.
        </p>

        {orderNumber && (
          <div className="bg-secondary/10 p-4 rounded-lg mb-6">
            <p className="text-sm text-text-secondary">Order Number</p>
            <p className="text-xl font-bold text-gradient">{orderNumber}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link href="/order">
            <Button variant="primary" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </Link>
          <Link href="/menu">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Menu
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-text-secondary">
            Having trouble? Contact us at{" "}
            <a href="tel:+4413271234567" className="text-secondary hover:underline">
              +44 (0) 1327 123 4567
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function OrderCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    }>
      <OrderCancelContent />
    </Suspense>
  );
} 