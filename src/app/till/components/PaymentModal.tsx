'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface PaymentModalProps {
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    paymentMethod: string;
    items: {
      id: string;
      menuItemName: string;
      quantity: number;
      totalPrice: number;
    }[];
  };
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (success: boolean, transactionId?: string) => void;
}

export default function PaymentModal({ order, isOpen, onClose, onPaymentComplete }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>(order.paymentMethod === 'card' ? 'card' : 'cash');
  const [cashAmount, setCashAmount] = useState(order.total);
  const [transactionId, setTransactionId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCardPayment = async () => {
    setIsProcessing(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Call payment processing API
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          orderNumber: order.orderNumber,
          amount: order.total,
          paymentMethod: 'card',
          customerName: order.customerName,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTransactionId(result.transactionId);
        setSuccess(true);
        setTimeout(() => {
          onPaymentComplete(true, result.transactionId);
          onClose();
        }, 2000);
      } else {
        setError(result.error || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('An error occurred. Please try again later.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCashPayment = async () => {
    if (cashAmount < order.total) {
      setError('Cash amount must be at least the order total');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Record cash payment
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          orderNumber: order.orderNumber,
          amount: order.total,
          paymentMethod: 'cash',
          cashAmount: cashAmount,
          customerName: order.customerName,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTransactionId(result.transactionId);
        setSuccess(true);
        setTimeout(() => {
          onPaymentComplete(true, result.transactionId);
          onClose();
        }, 2000);
      } else {
        setError(result.error || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('An error occurred. Please try again later.');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateChange = () => {
    return Math.max(0, cashAmount - order.total);
  };

  const handlePayment = async () => {
    if (paymentMethod === 'card') {
      await handleCardPayment();
    } else {
      await handleCashPayment();
    }
  };

  const resetModal = () => {
    setPaymentMethod(order.paymentMethod === 'card' ? 'card' : 'cash');
    setCashAmount(order.total);
    setTransactionId('');
    setError(null);
    setSuccess(false);
    setIsProcessing(false);
  };

  const handleClose = () => {
    if (!isProcessing) {
      resetModal();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md">
        <Card className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Process Payment</h2>
              <Button
                onClick={handleClose}
                variant="outline"
                className="border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                disabled={isProcessing}
              >
                ✕
              </Button>
            </div>
          </div>

          <div className="card-content space-y-4">
            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
                <Button 
                  onClick={() => setError(null)}
                  className="mt-2 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400"
                >
                  Dismiss
                </Button>
              </div>
            )}

            {/* Success Display */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <p className="text-green-400 text-sm">Payment processed successfully!</p>
                <p className="text-green-400 text-xs mt-1">Transaction ID: {transactionId}</p>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="font-semibold text-white mb-2">Order Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order:</span>
                  <span className="text-white font-medium">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Customer:</span>
                  <span className="text-white">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Items:</span>
                  <span className="text-white">{order.items.length}</span>
                </div>
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Total:</span>
                    <span className="text-yellow-400">£{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setPaymentMethod('card')}
                  variant={paymentMethod === 'card' ? 'primary' : 'outline'}
                  className={paymentMethod === 'card' ? 
                    'bg-yellow-500 hover:bg-yellow-600 text-black font-semibold' : 
                    'border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700'
                  }
                  disabled={isProcessing}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">💳</div>
                    <div className="font-medium">Card Payment</div>
                    <div className="text-xs opacity-75">SumUp Terminal</div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => setPaymentMethod('cash')}
                  variant={paymentMethod === 'cash' ? 'primary' : 'outline'}
                  className={paymentMethod === 'cash' ? 
                    'bg-yellow-500 hover:bg-yellow-600 text-black font-semibold' : 
                    'border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700'
                  }
                  disabled={isProcessing}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">💰</div>
                    <div className="font-medium">Cash Payment</div>
                    <div className="text-xs opacity-75">Manual Entry</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Cash Amount Input */}
            {paymentMethod === 'cash' && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Cash Amount Received
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={order.total}
                  value={cashAmount}
                  onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                  placeholder={`Minimum: £${order.total.toFixed(2)}`}
                  disabled={isProcessing}
                />
                {cashAmount > order.total && (
                  <p className="text-sm text-green-400 mt-1">
                    Change: £{calculateChange().toFixed(2)}
                  </p>
                )}
                {cashAmount < order.total && cashAmount > 0 && (
                  <p className="text-sm text-red-400 mt-1">
                    Insufficient amount
                  </p>
                )}
              </div>
            )}

            {/* Processing Status */}
            {isProcessing && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-2"></div>
                <p className="text-gray-300">
                  {paymentMethod === 'card' ? 'Processing card payment...' : 'Recording cash payment...'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handlePayment}
                disabled={isProcessing || (paymentMethod === 'cash' && cashAmount < order.total)}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : `Process ${paymentMethod === 'card' ? 'Card' : 'Cash'} Payment`}
              </Button>
              
              <Button
                onClick={handleClose}
                variant="outline"
                className="border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-3 rounded-lg transition-all duration-200"
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 