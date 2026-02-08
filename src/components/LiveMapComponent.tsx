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
    if (!mapRef.current || typeof window === 'undefined') return;
    
    // Don't initialize if we don't have a location yet
    if (!currentLocation) {
      return;
    }

    // Clean up existing map instance if it exists
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (error) {
        // Ignore cleanup errors
      }
      mapInstanceRef.current = null;
      setIsMapLoaded(false);
    }

    let retryCount = 0;
    const maxRetries = 100; // Maximum 10 seconds of retries (100 * 100ms)
    let initTimer: NodeJS.Timeout | null = null;
    let observer: IntersectionObserver | null = null;
    
    const initMap = () => {
      if (!mapRef.current) return;

      const container = mapRef.current;
      
      // Force minimum dimensions - always set them
      container.style.minHeight = '400px';
      container.style.minWidth = '100%';
      container.style.height = '100%';
      container.style.width = '100%';
      container.style.visibility = 'visible'; // Make sure it's visible for dimension detection
      
      // Check if container has dimensions
      const rect = container.getBoundingClientRect();
      const hasDimensions = rect.width > 0 && rect.height > 0;
      const hasOffsetDimensions = container.offsetHeight > 0 && container.offsetWidth > 0;
      
      // Wait for dimensions - but don't wait too long
      if (!hasDimensions || !hasOffsetDimensions) {
        retryCount++;
        if (retryCount < maxRetries) {
          initTimer = setTimeout(initMap, 100);
        } else {
          // Force initialization even if dimensions seem off
          // Sometimes getBoundingClientRect returns 0 even when element is visible
          console.warn('[LiveMap] Initializing map despite dimension check - container may need resize');
        }
        if (retryCount < maxRetries) {
          return;
        }
      }

      // Don't initialize if map already exists
      if (mapInstanceRef.current) {
        return;
      }

      try {
        // Ensure we have a valid location
        if (!currentLocation || !currentLocation.latitude || !currentLocation.longitude) {
          return;
        }

        // Create map instance
        const map = L.map(container, {
          center: [currentLocation.latitude, currentLocation.longitude],
          zoom: 15,
          zoomControl: showControls,
          attributionControl: true,
          preferCanvas: false,
        });

        // Add OpenStreetMap tile layer
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          minZoom: 1,
        }).addTo(map);

        mapInstanceRef.current = map;
        
        // Wait for map to be fully initialized before allowing operations
        // Use whenReady to ensure all map panes are created
        map.whenReady(() => {
          // Invalidate size immediately after map is ready
          const invalidateSize = () => {
            if (mapInstanceRef.current && mapInstanceRef.current.getContainer()) {
              try {
                mapInstanceRef.current.invalidateSize(false);
              } catch (e) {
                // Ignore invalidate errors
              }
            }
          };

          // Immediate invalidate
          invalidateSize();
          
          // Set loaded state after map is ready
          setIsMapLoaded(true);
          
          // Continue invalidating to ensure tiles load
          setTimeout(invalidateSize, 100);
          setTimeout(invalidateSize, 200);
          setTimeout(invalidateSize, 500);
          setTimeout(invalidateSize, 1000);
        });
      } catch (error) {
        console.error('[LiveMap] Error initializing map:', error);
        retryCount++;
        if (retryCount < maxRetries) {
          initTimer = setTimeout(initMap, 500);
        }
      }
    };

    // Use IntersectionObserver to detect when container becomes visible
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0) {
          // Container is visible, start initialization
          if (!mapInstanceRef.current && mapRef.current) {
            initTimer = setTimeout(initMap, 100);
          } else if (mapInstanceRef.current && mapRef.current) {
            // Map exists but might need size invalidation
            setTimeout(() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.invalidateSize(false);
              }
            }, 100);
          }
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '50px'
    });

    if (mapRef.current) {
      observer.observe(mapRef.current);
      // Try to initialize immediately
      initTimer = setTimeout(initMap, 100);
    }
    
    return () => {
      if (initTimer) {
        clearTimeout(initTimer);
      }
      if (observer) {
        observer.disconnect();
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          // Ignore cleanup errors
        }
        mapInstanceRef.current = null;
        setIsMapLoaded(false);
      }
    };
  }, [showControls, currentLocation]);

  // Update current location marker and map center
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;
    
    // Ensure map container exists and is ready
    if (!mapInstanceRef.current.getContainer()) return;

    const map = mapInstanceRef.current;

    if (currentLocation) {
      const { latitude, longitude } = currentLocation;
      
      try {
        // Update or create current location marker
        if (markersRef.current['current']) {
          // Update existing marker position
          markersRef.current['current'].setLatLng([latitude, longitude]);
          // Update popup content
          markersRef.current['current'].setPopupContent(`
            <div class="text-center">
              <h3 class="font-bold text-blue-600">Your Location</h3>
              <p class="text-sm text-gray-600">Lat: ${latitude.toFixed(6)}</p>
              <p class="text-sm text-gray-600">Lng: ${longitude.toFixed(6)}</p>
              <p class="text-xs text-gray-500 mt-1">Updated: ${new Date().toLocaleTimeString()}</p>
            </div>
          `);
        } else {
          // Create new marker
          const currentMarker = L.marker([latitude, longitude], {
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
              <p class="text-sm text-gray-600">Lat: ${latitude.toFixed(6)}</p>
              <p class="text-sm text-gray-600">Lng: ${longitude.toFixed(6)}</p>
              <p class="text-xs text-gray-500 mt-1">Updated: ${new Date().toLocaleTimeString()}</p>
            </div>
          `);

          markersRef.current['current'] = currentMarker;
        }

        // Smoothly pan to new location (only if it's significantly different)
        // Only do this if map is ready
        if (map.getContainer() && map.getContainer().offsetParent !== null) {
          const currentCenter = map.getCenter();
          const distance = map.distance(currentCenter, [latitude, longitude]);
          
          // Only pan if location changed by more than 50 meters
          if (distance > 50) {
            map.setView([latitude, longitude], 15, { animate: true, duration: 1.0 });
          }
        }
      } catch (error) {
        console.error('[LiveMap] Error updating location marker:', error);
      }
    } else {
      // Remove current location marker if location is null
      if (markersRef.current['current']) {
        try {
          map.removeLayer(markersRef.current['current']);
          delete markersRef.current['current'];
        } catch (error) {
          console.error('[LiveMap] Error removing location marker:', error);
        }
      }
    }
  }, [currentLocation, isMapLoaded]);

  // Update driver markers
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;
    
    // Ensure map container exists and is ready
    if (!mapInstanceRef.current.getContainer()) return;

    const map = mapInstanceRef.current;

    // Get current driver IDs
    const currentDriverIds = new Set(driverLocations.map(d => d.id));

    // Remove markers for drivers that are no longer in the list
    Object.keys(markersRef.current).forEach(markerId => {
      if (markerId !== 'current' && !currentDriverIds.has(markerId)) {
        map.removeLayer(markersRef.current[markerId]);
        delete markersRef.current[markerId];
      }
    });

    // Add or update driver markers
    driverLocations.forEach((driver) => {
      if (driver.latitude && driver.longitude) {
        if (markersRef.current[driver.id]) {
          // Update existing marker position
          markersRef.current[driver.id].setLatLng([driver.latitude, driver.longitude]);
          // Update popup content
          markersRef.current[driver.id].setPopupContent(`
            <div class="text-center">
              <h3 class="font-bold text-green-600">${driver.name}</h3>
              <p class="text-sm text-gray-600">Status: ${driver.isActive ? 'Active' : 'Inactive'}</p>
              <p class="text-sm text-gray-600">Lat: ${driver.latitude.toFixed(6)}</p>
              <p class="text-sm text-gray-600">Lng: ${driver.longitude.toFixed(6)}</p>
            </div>
          `);
        } else {
          // Create new marker
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
      }
    });
  }, [driverLocations, isMapLoaded]);

  // Invalidate map size when height changes or component becomes visible
  useEffect(() => {
    if (mapInstanceRef.current && isMapLoaded) {
      // Use setTimeout to ensure DOM has updated
      const timer = setTimeout(() => {
        if (mapInstanceRef.current && mapInstanceRef.current.getContainer()) {
          try {
            mapInstanceRef.current.invalidateSize(false);
            // Force a redraw
            mapInstanceRef.current.eachLayer((layer) => {
              if (layer instanceof L.TileLayer) {
                layer.redraw();
              }
            });
          } catch (error) {
            console.error('[LiveMap] Error invalidating size:', error);
          }
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [height, isMapLoaded]);

  // Force invalidate size when component mounts or becomes visible
  useEffect(() => {
    if (mapInstanceRef.current && isMapLoaded && mapRef.current) {
      // Check if element is visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && mapInstanceRef.current && mapInstanceRef.current.getContainer()) {
            setTimeout(() => {
              try {
                mapInstanceRef.current?.invalidateSize(false);
              } catch (error) {
                console.error('[LiveMap] Error invalidating size on visibility change:', error);
              }
            }, 100);
          }
        });
      }, { threshold: 0.1 });

      if (mapRef.current) {
        observer.observe(mapRef.current);
      }

      return () => {
        if (mapRef.current) {
          observer.unobserve(mapRef.current);
        }
      };
    }
  }, [isMapLoaded]);

  // Show error if no location
  if (!currentLocation) {
    return (
      <div 
        style={{ height: '100%', minHeight: '400px', width: '100%' }} 
        className="w-full rounded-lg overflow-hidden border border-gray-300 bg-gray-100 flex items-center justify-center"
      >
        <div className="text-center p-4">
          <p className="text-gray-600 mb-2">Location Required</p>
          <p className="text-sm text-gray-500">Please enable location access to view the map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ minHeight: height, height: '100%' }}>
      <div 
        ref={mapRef} 
        style={{ 
          height: '100%', 
          minHeight: '400px', 
          width: '100%',
          position: 'relative',
          zIndex: 1,
          visibility: isMapLoaded ? 'visible' : 'hidden'
        }} 
        className="w-full rounded-lg overflow-hidden border border-gray-300"
      />
      {!isMapLoaded && (
        <div 
          style={{ 
            height: '100%', 
            minHeight: '400px', 
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 10
          }} 
          className="w-full rounded-lg overflow-hidden border border-gray-300 bg-gray-100 flex items-center justify-center"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      
      {/* Map Controls */}
      {showControls && isMapLoaded && mapInstanceRef.current && (
        <div className="absolute top-2 right-2 z-[1000] bg-white rounded-lg shadow-lg p-2">
          <div className="text-xs text-gray-600 mb-2">Map Controls</div>
          <div className="space-y-1">
            <button
              onClick={() => {
                if (mapInstanceRef.current && mapInstanceRef.current.getContainer()) {
                  try {
                    mapInstanceRef.current.setZoom(15);
                  } catch (e) {
                    console.error('[LiveMap] Error zooming in:', e);
                  }
                }
              }}
              className="block w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Zoom In
            </button>
            <button
              onClick={() => {
                if (mapInstanceRef.current && mapInstanceRef.current.getContainer()) {
                  try {
                    mapInstanceRef.current.setZoom(10);
                  } catch (e) {
                    console.error('[LiveMap] Error zooming out:', e);
                  }
                }
              }}
              className="block w-full px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Zoom Out
            </button>
            {currentLocation && (
              <button
                onClick={() => {
                  if (mapInstanceRef.current && mapInstanceRef.current.getContainer()) {
                    try {
                      mapInstanceRef.current.setView([currentLocation.latitude, currentLocation.longitude], 15);
                    } catch (e) {
                      console.error('[LiveMap] Error centering map:', e);
                    }
                  }
                }}
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