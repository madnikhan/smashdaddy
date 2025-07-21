'use client';

import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const DriverTrackingMapComponent = dynamic(() => import('./DriverTrackingMapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading driver map...</p>
      </div>
    </div>
  ),
});

interface Driver {
  id: string;
  user: {
    name: string;
  };
  currentLocation: {
    latitude: number;
    longitude: number;
    timestamp: string;
  } | null;
  isAvailable: boolean;
  deliveries: Array<{
    id: string;
    orderNumber: string;
    customer: {
      user: {
        name: string;
      };
    };
    customerAddress: string;
  }>;
}

interface DriverTrackingMapProps {
  drivers: Driver[];
  height?: string;
}

export default function DriverTrackingMap(props: DriverTrackingMapProps) {
  return <DriverTrackingMapComponent {...props} />;
} 