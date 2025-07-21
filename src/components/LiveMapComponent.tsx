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

interface LiveMapComponentProps {
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

export default function LiveMapComponent({ 
  currentLocation, 
  driverLocations = [], 
  height = "400px",
  showControls = true 
}: LiveMapComponentProps) {
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
      zoom: 13,
      zoomControl: showControls,
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
  }, [showControls]);

  // Update map center when current location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !currentLocation) return;

    const { latitude, longitude } = currentLocation;
    mapInstanceRef.current.setView([latitude, longitude], 15);
  }, [currentLocation]);

  // Update driver markers
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = {};

    // Add current location marker
    if (currentLocation) {
      const currentMarker = L.marker([currentLocation.latitude, currentLocation.longitude], {
        icon: L.divIcon({
          className: 'custom-marker current-location',
          html: '<div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      }).addTo(map);

      // Add popup for current location
      currentMarker.bindPopup(`
        <div class="text-center">
          <h3 class="font-bold text-blue-600">Your Location</h3>
          <p class="text-sm text-gray-600">Lat: ${currentLocation.latitude.toFixed(6)}</p>
          <p class="text-sm text-gray-600">Lng: ${currentLocation.longitude.toFixed(6)}</p>
        </div>
      `);

      markersRef.current['current'] = currentMarker;
    }

    // Add driver markers
    driverLocations.forEach((driver) => {
      if (driver.latitude && driver.longitude) {
        const driverMarker = L.marker([driver.latitude, driver.longitude], {
          icon: L.divIcon({
            className: 'custom-marker driver-location',
            html: `
              <div class="w-8 h-8 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <span class="text-white text-xs font-bold">${driver.name.charAt(0)}</span>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        }).addTo(map);

        // Add popup for driver
        driverMarker.bindPopup(`
          <div class="text-center">
            <h3 class="font-bold text-green-600">${driver.name}</h3>
            <p class="text-sm text-gray-600">Status: ${driver.isActive ? 'Active' : 'Inactive'}</p>
            <p class="text-sm text-gray-600">Lat: ${driver.latitude.toFixed(6)}</p>
            <p class="text-sm text-gray-600">Lng: ${driver.longitude.toFixed(6)}</p>
          </div>
        `);

        markersRef.current[driver.id] = driverMarker;
      }
    });
  }, [currentLocation, driverLocations, isMapLoaded]);

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ height }} 
        className="w-full rounded-lg overflow-hidden border border-gray-300"
      />
      
      {/* Map Controls */}
      {showControls && isMapLoaded && (
        <div className="absolute top-2 right-2 z-[1000] bg-white rounded-lg shadow-lg p-2">
          <div className="text-xs text-gray-600 mb-2">Map Controls</div>
          <div className="space-y-1">
            <button
              onClick={() => mapInstanceRef.current?.setZoom(15)}
              className="block w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Zoom In
            </button>
            <button
              onClick={() => mapInstanceRef.current?.setZoom(10)}
              className="block w-full px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Zoom Out
            </button>
            {currentLocation && (
              <button
                onClick={() => mapInstanceRef.current?.setView([currentLocation.latitude, currentLocation.longitude], 15)}
                className="block w-full px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
              >
                Center on You
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 