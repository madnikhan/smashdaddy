'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ReceiptModalProps {
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone?: string;
    items: Array<{
      id: string;
      menuItemName: string;
      quantity: number;
      totalPrice: number;
    }>;
    total: number;
    paymentMethod: string;
    orderType: string;
    createdAt: string;
    transactionId?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function ReceiptModal({ order, isOpen, onClose }: ReceiptModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    setIsPrinting(true);
    
    // Create print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>STACK'D Receipt - ${order.orderNumber}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              margin: 0;
              padding: 20px;
              max-width: 300px;
            }
            .header {
              text-align: center;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .business-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .business-info {
              font-size: 10px;
              margin-bottom: 5px;
            }
            .order-info {
              margin-bottom: 15px;
            }
            .order-number {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .items {
              margin-bottom: 15px;
            }
            .item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .item-name {
              flex: 1;
            }
            .item-quantity {
              margin: 0 10px;
            }
            .item-price {
              text-align: right;
              min-width: 50px;
            }
            .total {
              border-top: 1px dashed #000;
              padding-top: 10px;
              margin-top: 10px;
              font-weight: bold;
            }
            .payment-info {
              margin-top: 15px;
              font-size: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 10px;
              border-top: 1px dashed #000;
              padding-top: 10px;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="business-name">STACK'D</div>
            <div class="business-info">Premium Smashed Burgers & Wings</div>
            <div class="business-info">St John's Square, Daventry NN11 4HY</div>
            <div class="business-info">Tel: +44 (0) 1327 123 4567</div>
          </div>
          
          <div class="order-info">
            <div class="order-number">Order #${order.orderNumber}</div>
            <div>Customer: ${order.customerName}</div>
            ${order.customerPhone ? `<div>Phone: ${order.customerPhone}</div>` : ''}
            <div>Type: ${order.orderType.toUpperCase()}</div>
            <div>Date: ${formatDate(order.createdAt)}</div>
            <div>Time: ${formatTime(order.createdAt)}</div>
          </div>
          
          <div class="items">
            ${order.items.map(item => `
              <div class="item">
                <span class="item-name">${item.menuItemName}</span>
                <span class="item-quantity">${item.quantity}x</span>
                <span class="item-price">£${item.totalPrice.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="total">
            <div class="item">
              <span>Total</span>
              <span></span>
              <span class="item-price">£${order.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="payment-info">
            <div>Payment Method: ${order.paymentMethod.toUpperCase()}</div>
            ${order.transactionId ? `<div>Transaction ID: ${order.transactionId}</div>` : ''}
          </div>
          
          <div class="footer">
            <div>Thank you for choosing STACK'D!</div>
            <div>Please keep this receipt for your records</div>
            <div>www.stackd-daventry.co.uk</div>
          </div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setIsPrinting(false);
        onClose();
      }, 500);
    } else {
      setIsPrinting(false);
      alert('Please allow pop-ups to print receipts');
    }
  };

  const handleEmailReceipt = async () => {
    // TODO: Implement email receipt functionality
    alert('Email receipt feature coming soon!');
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download functionality
    alert('PDF download feature coming soon!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md">
        <Card className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Receipt</h2>
              <Button
                onClick={onClose}
                variant="outline"
                className="border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                disabled={isPrinting}
              >
                ✕
              </Button>
            </div>
          </div>

          <div className="card-content space-y-4">
            {/* Receipt Preview */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 font-mono text-sm">
              <div className="text-center border-b border-gray-600 pb-2 mb-3">
                <div className="font-bold text-lg">STACK'D</div>
                <div className="text-xs text-gray-400">Premium Smashed Burgers & Wings</div>
                <div className="text-xs text-gray-400">St John's Square, Daventry NN11 4HY</div>
              </div>
              
              <div className="mb-3">
                <div className="font-bold">Order #{order.orderNumber}</div>
                <div>Customer: {order.customerName}</div>
                {order.customerPhone && <div>Phone: {order.customerPhone}</div>}
                <div>Type: {order.orderType.toUpperCase()}</div>
                <div>Date: {formatDate(order.createdAt)}</div>
                <div>Time: {formatTime(order.createdAt)}</div>
              </div>
              
              <div className="mb-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between mb-1">
                    <span className="flex-1">{item.menuItemName}</span>
                    <span className="mx-2">{item.quantity}x</span>
                    <span className="text-right min-w-[50px]">£{item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-600 pt-2 mb-3">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>£{order.total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-400 mb-3">
                <div>Payment Method: {order.paymentMethod.toUpperCase()}</div>
                {order.transactionId && <div>Transaction ID: {order.transactionId}</div>}
              </div>
              
              <div className="text-center text-xs text-gray-400 border-t border-gray-600 pt-2">
                <div>Thank you for choosing STACK'D!</div>
                <div>Please keep this receipt for your records</div>
                <div>www.stackd-daventry.co.uk</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handlePrint}
                disabled={isPrinting}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {isPrinting ? 'Printing...' : 'Print Receipt'}
              </Button>
              
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                className="border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-3 rounded-lg transition-all duration-200"
              >
                PDF
              </Button>
              
              <Button
                onClick={handleEmailReceipt}
                variant="outline"
                className="border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-3 rounded-lg transition-all duration-200"
              >
                Email
              </Button>
            </div>
            
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 py-3 rounded-lg transition-all duration-200"
            >
              Close
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
} 