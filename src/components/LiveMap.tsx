'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet to avoid SSR issues
const LiveMapComponent = dynamic(() => import('./LiveMapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

interface LiveMapProps {
  currentLocation: { latitude: number; longitude: number } | null;
  driverLocations?: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    isActive: boolean;
  }>;
  height?: string;
  showControls?: boolean;
}

export default function LiveMap(props: LiveMapProps) {
  return <LiveMapComponent {...props} />;
} 