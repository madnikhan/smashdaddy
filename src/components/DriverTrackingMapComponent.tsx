'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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

interface DriverTrackingMapComponentProps {
  drivers: Driver[];
  height?: string;
}

export default function DriverTrackingMapComponent({ drivers, height = "500px" }: DriverTrackingMapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || typeof window === 'undefined') return;

    // Create map instance
    const map = L.map(mapRef.current, {
      center: [51.505, -0.09], // Default center (London)
      zoom: 10,
      zoomControl: true,
      attributionControl: true,
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    setIsMapLoaded(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update driver markers
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = {};

    const activeDrivers = drivers.filter(driver => 
      driver.currentLocation && driver.isAvailable && driver.user
    );

    if (activeDrivers.length === 0) {
      // Center on default location if no drivers
      map.setView([51.505, -0.09], 10);
      return;
    }

    // Add driver markers
    activeDrivers.forEach((driver) => {
      if (driver.currentLocation && driver.user) {
        const { latitude, longitude } = driver.currentLocation;
        
        const driverMarker = L.marker([latitude, longitude], {
          icon: L.divIcon({
            className: 'custom-marker driver-location',
            html: `
              <div class="w-10 h-10 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                <span class="text-white text-sm font-bold">${driver.user.name.charAt(0)}</span>
              </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          }),
        }).addTo(map);

        // Create popup content
        const deliveriesList = driver.deliveries && driver.deliveries.length > 0 
          ? driver.deliveries.map(delivery => 
              `<div class="text-xs mb-1">
                <strong>Order #${delivery.orderNumber}</strong> - ${delivery.customer?.user?.name || 'Unknown'}
                <br><span class="text-gray-500">${delivery.customerAddress}</span>
              </div>`
            ).join('')
          : '<div class="text-xs text-gray-500">No active deliveries</div>';

        const popupContent = `
          <div class="text-center min-w-[200px]">
            <h3 class="font-bold text-green-600 text-lg">${driver.user.name}</h3>
            <div class="text-xs text-gray-600 mb-2">
              Status: <span class="text-green-500 font-bold">Active</span>
            </div>
            <div class="text-xs text-gray-600 mb-2">
              Last Update: ${new Date(driver.currentLocation.timestamp).toLocaleTimeString()}
            </div>
            <div class="text-xs text-gray-600 mb-2">
              Lat: ${latitude.toFixed(6)}<br>
              Lng: ${longitude.toFixed(6)}
            </div>
            <div class="border-t pt-2 mt-2">
              <div class="text-xs font-bold text-gray-700 mb-1">Active Deliveries:</div>
              ${deliveriesList}
            </div>
          </div>
        `;

        driverMarker.bindPopup(popupContent);
        markersRef.current[driver.id] = driverMarker;
      }
    });

    // Fit map to show all drivers
    if (activeDrivers.length > 0) {
      const bounds = L.latLngBounds(
        activeDrivers.map(driver => [
          driver.currentLocation!.latitude,
          driver.currentLocation!.longitude
        ])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [drivers, isMapLoaded]);

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ height }} 
        className="w-full rounded-lg overflow-hidden border border-gray-300"
      />
      
      {/* Map Legend */}
      <div className="absolute bottom-2 left-2 z-[1000] bg-white rounded-lg shadow-lg p-3">
        <div className="text-xs font-bold text-gray-700 mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full border border-white"></div>
            <span className="text-xs text-gray-600">Active Driver</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full border border-white animate-pulse"></div>
            <span className="text-xs text-gray-600">Your Location</span>
          </div>
        </div>
      </div>

      {/* Driver Count */}
      <div className="absolute top-2 left-2 z-[1000] bg-white rounded-lg shadow-lg p-2">
        <div className="text-xs font-bold text-gray-700">
          Active Drivers: {drivers.filter(d => d.currentLocation && d.isAvailable && d.user).length}
        </div>
      </div>
    </div>
  );
} 