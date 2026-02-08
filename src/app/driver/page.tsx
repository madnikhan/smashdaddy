'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import InstallPrompt from '@/components/InstallPrompt';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Phone, 
  User, 
  Package, 
  DollarSign,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  LogOut,
  Navigation,
  Map,
  RefreshCw
} from 'lucide-react';
import LiveMap from '@/components/LiveMap';

interface Driver {
  id: string;
  userId: string;
  phone: string;
  vehicleInfo: any;
  isAvailable: boolean;
  currentLocation: any;
  rating: number;
  totalDeliveries: number;
  earnings: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerPostcode: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export default function DriverDashboard() {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [locationUpdateInterval, setLocationUpdateInterval] = useState<NodeJS.Timeout | null>(null);
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [manualLatitude, setManualLatitude] = useState('');
  const [manualLongitude, setManualLongitude] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const router = useRouter();
  const lastLocationRef = useRef<{ lat: number; lng: number; time: number } | null>(null);
  const ordersRef = useRef<Order[]>([]);

  // Update ref when orders change
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  // Check authentication on component mount
  useEffect(() => {
    const driverData = localStorage.getItem('driverData');
    if (!driverData) {
      router.push('/driver/login');
      return;
    }

    try {
      const parsedDriver = JSON.parse(driverData);
      setDriver(parsedDriver);
      setIsAvailable(parsedDriver.isAvailable);
    } catch (error) {
      console.error('Error parsing driver data:', error);
      localStorage.removeItem('driverData');
      router.push('/driver/login');
    }
  }, [router]);

  // Get current location and start tracking
  useEffect(() => {
    if (!driver) return;

    const getCurrentLocation = () => {
      // Check if we're in a secure context (HTTPS is required for geolocation)
      if (!window.isSecureContext) {
        // Allow localhost in development
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
          setLocationError('Location access requires HTTPS. Please access this page via HTTPS.');
          return;
        }
      }
      
      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by this browser. Please use a modern browser.');
        return;
      }

      // Check permission status if available (silently)
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (result.state === 'denied') {
            setLocationError('Location access is blocked. Please enable location access in your browser settings.');
          }
        }).catch(() => {
          // Silently ignore permission query errors
        });
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          setLocationError(null);
          
          // Update location on server
          updateLocationOnServer(latitude, longitude, position.coords.accuracy);
        },
        (error) => {
          // Only log errors, not debug info
          if (error.code !== error.TIMEOUT) {
            console.error('[DriverLocation] Geolocation error:', error.message);
          }
          
          // Provide specific error messages based on error code
          let errorMessage = 'Unable to get your location. ';
          let detailedHelp = '';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Location access was denied. Please allow location access in your browser settings and refresh the page.';
              detailedHelp = 'Go to browser settings and enable location access for this site.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable. Please check your device location settings.';
              detailedHelp = 'Enable Location Services in System Preferences (macOS) or Settings (iOS/Android).';
              break;
            case error.TIMEOUT:
              // Don't show error for timeout - just silently retry
              return;
            default:
              errorMessage += 'Please check your browser settings and ensure location access is enabled.';
              detailedHelp = 'Try refreshing the page or restarting your browser.';
          }
          
          // Add specific help for macOS users
          if (navigator.userAgent.includes('Mac')) {
            detailedHelp += '\n\nFor macOS users:\n• System Preferences → Security & Privacy → Privacy → Location Services\n• Enable Location Services and allow browser access';
          }
          
          setLocationError(`${errorMessage}\n\nHelp: ${detailedHelp}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // Increased timeout to 15 seconds
          maximumAge: 30000, // 30 seconds
        }
      );
    };

    // Start location tracking
    getCurrentLocation();
    
    // Set up periodic location updates (every 60 seconds to reduce server load)
    const interval = setInterval(getCurrentLocation, 60000);
    setLocationUpdateInterval(interval);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [driver]);

  // Manual location refresh
  const refreshLocation = () => {
    setLocationError(null);
    if (navigator.geolocation) {
      // Try with high accuracy first
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          setLocationError(null);
          updateLocationOnServer(latitude, longitude, position.coords.accuracy);
        },
        (error) => {
          // Fallback to lower accuracy
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setCurrentLocation({ latitude, longitude });
              setLocationError(null);
              updateLocationOnServer(latitude, longitude, position.coords.accuracy);
            },
            (fallbackError) => {
              // Only log if both attempts failed (and not timeout)
              if (error.code !== error.TIMEOUT && fallbackError.code !== fallbackError.TIMEOUT) {
                console.error('[DriverLocation] Location refresh failed:', fallbackError.message);
              }
              
              let errorMessage = 'Unable to get your location. ';
              switch (fallbackError.code) {
                case fallbackError.PERMISSION_DENIED:
                  errorMessage += 'Location access was denied. Please allow location access in your browser settings.';
                  break;
                case fallbackError.POSITION_UNAVAILABLE:
                  errorMessage += 'Location information is unavailable. Please check your device location settings.';
                  break;
                case fallbackError.TIMEOUT:
                  errorMessage += 'Location request timed out. Please try again.';
                  break;
                default:
                  errorMessage += 'Please check your browser settings and ensure location access is enabled.';
              }
              
              setLocationError(errorMessage);
            },
            {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 60000, // 1 minute
            }
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  };

  // Update location on server
  const updateLocationOnServer = async (latitude: number, longitude: number, accuracy?: number) => {
    if (!driver) return;
    
    // Throttle location updates - only update if location changed significantly (more than 10 meters)
    const now = Date.now();
    
    if (lastLocationRef.current) {
      const timeSinceLastUpdate = now - lastLocationRef.current.time;
      const distance = Math.sqrt(
        Math.pow(latitude - lastLocationRef.current.lat, 2) + 
        Math.pow(longitude - lastLocationRef.current.lng, 2)
      ) * 111000; // Convert to meters (rough approximation)
      
      // Only update if location changed by more than 10 meters OR it's been more than 30 seconds
      if (distance < 10 && timeSinceLastUpdate < 30000) {
        return; // Skip update - location hasn't changed enough
      }
    }
    
    lastLocationRef.current = { lat: latitude, lng: longitude, time: now };

    try {
      const response = await fetch(`/api/drivers/${driver.id}/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude,
          longitude,
          accuracy,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        // Silently handle network errors - they're usually temporary
        return null;
      });

      if (!response || !response.ok) {
        // Only log if it's not a network error
        if (response) {
          const errorText = await response.text().catch(() => '');
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error && !errorData.error.includes('network')) {
              console.error('[DriverLocation] Failed to update location:', errorData.error);
            }
          } catch {
            // Ignore parse errors
          }
        }
        return;
      }

      const data = await response.json().catch(() => null);
      if (data && !data.success && data.error) {
        console.error('[DriverLocation] Server error:', data.error);
      }
    } catch (error) {
      // Only log unexpected errors
      if (error instanceof Error && !error.message.includes('fetch')) {
        console.error('[DriverLocation] Unexpected error:', error.message);
      }
    }
  };

  // Helper function to safely parse JSON response
  const safeJsonParse = async (response: Response) => {
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 100)}`);
    }
    return response.json();
  };

  // Fetch latest driver data from API (silent background update)
  const fetchLatestDriverData = async () => {
    if (!driver) return;

    try {
      const response = await fetch(`/api/drivers/${driver.id}`).catch(() => {
        // Silently handle network errors - this is a background update
        return null;
      });

      if (response && response.ok) {
        try {
          const data = await safeJsonParse(response);
          if (data.success && data.driver) {
            // Update driver state with latest data (including updated rating)
            setDriver(prevDriver => ({
              ...prevDriver!,
              ...data.driver,
            }));
            // Also update localStorage to keep it in sync
            localStorage.setItem('driverData', JSON.stringify(data.driver));
          }
        } catch {
          // Silently ignore parse errors in background updates
        }
      }
    } catch {
      // Silently ignore errors - this is a background update
    }
  };

  // Fetch driver data and orders
  useEffect(() => {
    if (!driver) return;

    // Fetch latest driver data first (to get updated rating)
    fetchLatestDriverData();

    const fetchDriverData = async () => {
      try {
        // Fetch orders for this driver - try multiple status values
        const response = await fetch('/api/orders?limit=50').catch((fetchError) => {
          // Silently handle network errors during polling
          return null;
        });
        
        if (!response) {
          // Network error - only show error on initial load, not during polling
          if (ordersRef.current.length === 0) {
            setFetchError('Unable to connect to server. Please check your internet connection and ensure the server is running.');
          }
          setLoading(false);
          return;
        }

        if (!response.ok) {
          // Only show error on initial load
          if (ordersRef.current.length === 0) {
            const errorText = await response.text().catch(() => '');
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { error: errorText || response.statusText };
            }
            setFetchError(`Failed to fetch orders: ${errorData.error || response.statusText}`);
          }
          setLoading(false);
          return;
        }

        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // Only show error on initial load
          if (ordersRef.current.length === 0) {
            setFetchError('Server returned invalid response. Please try refreshing the page.');
          }
          setLoading(false);
          return;
        }

        const data = await response.json().catch((parseError) => {
          console.error('[DriverDashboard] Error parsing orders response:', parseError);
          return null;
        });
        
        if (data && data.success) {
          // Clear any previous fetch errors on success
          setFetchError(null);
          
          // Filter orders that are assigned to this driver or available for pickup
          // Also include orders with status OUT_FOR_DELIVERY or READY_FOR_PICKUP
          const driverOrders = data.orders.filter((order: Order) => {
            const status = order.status?.toUpperCase();
            return (
              status === 'OUT_FOR_DELIVERY' || 
              status === 'READY_FOR_PICKUP' ||
              status === 'READY_FOR_DELIVERY'
            );
          });
          setOrders(driverOrders);
          ordersRef.current = driverOrders; // Update ref
        } else if (data && !data.success && ordersRef.current.length === 0) {
          // Only show error on initial load
          setFetchError(data.error || 'Failed to fetch orders. Please try refreshing the page.');
        }
      } catch (error) {
        // Only show error on initial load
        if (ordersRef.current.length === 0) {
          if (error instanceof TypeError && error.message === 'Failed to fetch') {
            setFetchError('Unable to connect to server. Please check your internet connection and ensure the server is running.');
          } else {
            setFetchError('An error occurred while fetching orders. Please try refreshing the page.');
          }
        }
      } finally {
        // Only set loading to false on initial load, not during polling
        if (ordersRef.current.length === 0) {
          setLoading(false);
        }
      }
    };

    fetchDriverData();
    
    // Set up polling for real-time updates (both orders and driver data)
    // Poll every 30 seconds to reduce server load and console noise
    const interval = setInterval(() => {
      fetchDriverData();
      fetchLatestDriverData(); // Also refresh driver data to get updated rating
    }, 30000); // Poll every 30 seconds
    
    return () => {
      clearInterval(interval);
    };
  }, [driver]);

  // Toggle availability
  const toggleAvailability = async () => {
    if (!driver) return;

    try {
      const response = await fetch(`/api/drivers/${driver.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isAvailable: !isAvailable,
        }),
      });

      if (response.ok) {
        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const data = await response.json();
            if (data.success) {
              // Update state with the server response
              setIsAvailable(data.driver.isAvailable);
              setDriver(data.driver);
              // Update localStorage with the fresh data
              localStorage.setItem('driverData', JSON.stringify(data.driver));
            }
          } catch (parseError) {
            console.error('Error parsing response:', parseError);
          }
        } else {
          const text = await response.text();
          console.error('Expected JSON but got:', contentType, text.substring(0, 200));
        }
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  // Accept delivery order
  const acceptOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'OUT_FOR_DELIVERY',
          driverId: driver?.id,
        }),
      });

      if (response.ok) {
        // Refresh orders
        const ordersResponse = await fetch('/api/orders?status=OUT_FOR_DELIVERY&limit=20');
        if (ordersResponse.ok) {
          const contentType = ordersResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            try {
              const ordersData = await ordersResponse.json();
              if (ordersData.success) {
                setOrders(ordersData.orders);
              }
            } catch (parseError) {
              console.error('Error parsing orders response:', parseError);
            }
          } else {
            const text = await ordersResponse.text();
            console.error('Expected JSON but got:', contentType, text.substring(0, 200));
          }
        }
      }
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };

  // Complete delivery
  const completeDelivery = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'DELIVERED',
        }),
      });

      if (response.ok) {
        // Refresh orders
        const ordersResponse = await fetch('/api/orders?status=OUT_FOR_DELIVERY&limit=20');
        if (ordersResponse.ok) {
          const contentType = ordersResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            try {
              const ordersData = await ordersResponse.json();
              if (ordersData.success) {
                setOrders(ordersData.orders);
              }
            } catch (parseError) {
              console.error('Error parsing orders response:', parseError);
            }
          } else {
            const text = await ordersResponse.text();
            console.error('Expected JSON but got:', contentType, text.substring(0, 200));
          }
        }
      }
    } catch (error) {
      console.error('Error completing delivery:', error);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('driverData');
    router.push('/driver/login');
  };

  // Get directions to customer using Google Maps
  const getDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  // Get directions with current location
  const getDirectionsWithLocation = (address: string, city?: string, postcode?: string) => {
    // Build full address string
    let fullAddress = address;
    if (city) {
      fullAddress += `, ${city}`;
    }
    if (postcode) {
      fullAddress += ` ${postcode}`;
    }
    
    const encodedAddress = encodeURIComponent(fullAddress);
    
    if (!currentLocation) {
      // Fallback to basic directions without current location
      console.log('No current location available, using basic directions');
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
      return;
    }
    
    const { latitude, longitude } = currentLocation;
    
    // Use Google Maps with current location
    // Using current location for directions
    window.open(`https://www.google.com/maps/dir/${latitude},${longitude}/${encodedAddress}`, '_blank');
  };

  // Test geolocation function for debugging (silent)
  const testGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Geolocation test successful (silent)
        },
        (error) => {
          // Only log non-timeout errors
          if (error.code !== error.TIMEOUT) {
            console.error('[DriverLocation] Geolocation test failed:', error.message);
          }
        },
        { timeout: 5000 }
      );
    }
  };

  // Set manual location
  const setManualLocation = () => {
    const lat = parseFloat(manualLatitude);
    const lng = parseFloat(manualLongitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid latitude and longitude values.');
      return;
    }
    
    if (lat < -90 || lat > 90) {
      alert('Latitude must be between -90 and 90.');
      return;
    }
    
    if (lng < -180 || lng > 180) {
      alert('Longitude must be between -180 and 180.');
      return;
    }
    
    setCurrentLocation({ latitude: lat, longitude: lng });
    setLocationError(null);
    setShowManualLocation(false);
    updateLocationOnServer(lat, lng);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading driver dashboard...</p>
        </div>
      </div>
    );
  }

  if (!driver) {
    return null;
  }

  return (
    <>
      <InstallPrompt />
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 px-4 py-3 md:px-6 md:py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <Truck className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-white">Driver Dashboard</h1>
              <p className="text-blue-200 text-sm md:text-base">Welcome back, {driver.user.name}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            {/* Location Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${currentLocation ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              <span className="text-white text-xs md:text-sm">
                {currentLocation ? 'Location Active' : 'Location Offline'}
              </span>
            </div>

            {/* Location Instructions */}
            {!currentLocation && !locationError && (
              <div className="text-yellow-300 text-xs">
                Allow location access to enable tracking
              </div>
            )}

            {/* Map Toggle */}
            <button
              onClick={() => setShowMap(!showMap)}
              className="flex items-center space-x-1 md:space-x-2 px-2 py-1 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs md:text-sm"
            >
              <Map className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">{showMap ? 'Hide Map' : 'Show Map'}</span>
              <span className="sm:hidden">{showMap ? 'Hide' : 'Map'}</span>
            </button>

            {/* Availability Toggle */}
            <button
              onClick={toggleAvailability}
              className={`flex items-center space-x-1 md:space-x-2 px-2 py-1 md:px-4 md:py-2 rounded-lg transition-colors text-xs md:text-sm ${
                isAvailable 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              <div className={`w-1 h-1 md:w-2 md:h-2 rounded-full ${isAvailable ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="hidden sm:inline">{isAvailable ? 'Available' : 'Unavailable'}</span>
              <span className="sm:hidden">{isAvailable ? 'On' : 'Off'}</span>
            </button>

            <button
              onClick={refreshLocation}
              className="flex items-center space-x-1 md:space-x-2 px-2 py-1 md:px-4 md:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-xs md:text-sm"
            >
              <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Refresh Location</span>
              <span className="sm:hidden">Refresh</span>
            </button>

            <button
              onClick={testGeolocation}
              className="flex items-center space-x-1 md:space-x-2 px-2 py-1 md:px-4 md:py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-xs md:text-sm"
              title="Test geolocation functionality"
            >
              <MapPin className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Test Location</span>
              <span className="sm:hidden">Test</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 md:space-x-2 px-2 py-1 md:px-4 md:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs md:text-sm"
            >
              <LogOut className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Fetch Error Alert */}
      {fetchError && (
        <div className="bg-yellow-500 text-white px-4 py-3 md:px-6 md:py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm md:text-base">Connection Issue</p>
                <p className="text-xs md:text-sm text-yellow-100 mt-1">{fetchError}</p>
              </div>
            </div>
            <button
              onClick={() => setFetchError(null)}
              className="text-white hover:text-yellow-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Location Error Alert */}
      {locationError && (
        <div className="bg-red-500 text-white px-4 py-3 md:px-6 md:py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm md:text-base">Location Access Required</p>
                <p className="text-xs md:text-sm text-red-100 mt-1">{locationError}</p>
                {locationError.includes('denied') && (
                  <div className="mt-2 text-xs text-red-100">
                    <p><strong>How to enable location:</strong></p>
                    <p>• Chrome: Click the lock icon in the address bar → Allow location</p>
                    <p>• Safari: Safari → Preferences → Privacy → Location Services</p>
                    <p>• Firefox: Click the shield icon → Permissions → Location</p>
                  </div>
                )}
                {locationError.includes('unavailable') && (
                  <div className="mt-2 text-xs text-red-100">
                    <p><strong>For macOS users:</strong></p>
                    <p>• System Preferences → Security & Privacy → Privacy → Location Services</p>
                    <p>• Enable Location Services and allow browser access</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={refreshLocation}
                className="px-2 py-1 md:px-3 md:py-1 bg-white text-red-600 rounded text-xs hover:bg-red-50 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => setShowManualLocation(true)}
                className="px-2 py-1 md:px-3 md:py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 transition-colors"
              >
                Manual Location
              </button>
              <button
                onClick={() => setLocationError(null)}
                className="text-white hover:text-red-200"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Location Modal */}
      {showManualLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Set Manual Location</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude (e.g., 51.5074)
                </label>
                <input
                  type="number"
                  step="any"
                  value={manualLatitude}
                  onChange={(e) => setManualLatitude(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Enter latitude"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude (e.g., -0.1278)
                </label>
                <input
                  type="number"
                  step="any"
                  value={manualLongitude}
                  onChange={(e) => setManualLongitude(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Enter longitude"
                />
              </div>
              <div className="text-xs text-gray-500">
                <p>You can find coordinates at: <a href="https://www.latlong.net/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">latlong.net</a></p>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={setManualLocation}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-base font-medium"
              >
                Set Location
              </button>
              <button
                onClick={() => setShowManualLocation(false)}
                className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-base font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] md:h-[calc(100vh-80px)]">
        {/* Main Content */}
        <div className={`${showMap ? 'w-full lg:w-1/2' : 'w-full'} p-3 md:p-6 overflow-y-auto`}>
          {/* Driver Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-white/20">
              <div className="flex items-center space-x-2 md:space-x-3">
                <Package className="w-4 h-4 md:w-6 md:h-6 text-blue-400" />
                <div>
                  <p className="text-white text-xs md:text-sm">Total Deliveries</p>
                  <p className="text-lg md:text-2xl font-bold text-white">{driver.totalDeliveries}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-white/20">
              <div className="flex items-center space-x-2 md:space-x-3">
                <DollarSign className="w-4 h-4 md:w-6 md:h-6 text-green-400" />
                <div>
                  <p className="text-white text-xs md:text-sm">Total Earnings</p>
                  <p className="text-lg md:text-2xl font-bold text-white">£{driver.earnings.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-white/20">
              <div className="flex items-center space-x-2 md:space-x-3">
                <Star className="w-4 h-4 md:w-6 md:h-6 text-yellow-400" />
                <div>
                  <p className="text-white text-xs md:text-sm">Rating</p>
                  <p className="text-lg md:text-2xl font-bold text-white">{driver.rating.toFixed(1)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-white/20">
              <div className="flex items-center space-x-2 md:space-x-3">
                <Clock className="w-4 h-4 md:w-6 md:h-6 text-purple-400" />
                <div>
                  <p className="text-white text-xs md:text-sm">Active Orders</p>
                  <p className="text-lg md:text-2xl font-bold text-white">{orders.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="space-y-3 md:space-y-4">
            <h2 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">Active Orders</h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-8 md:py-12">
                <Package className="w-12 h-12 md:w-16 md:h-16 text-white/50 mx-auto mb-3 md:mb-4" />
                <p className="text-white/70 text-base md:text-lg">No active orders</p>
                <p className="text-white/50 text-sm">Orders will appear here when assigned</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-white/20">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3 md:mb-4 space-y-2 md:space-y-0">
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-white">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-blue-200 text-sm md:text-base">{order.customerName}</p>
                      <p className="text-white/70 text-xs md:text-sm">
                        {order.customerAddress}
                        {order.customerCity && `, ${order.customerCity}`}
                        {order.customerPostcode && ` ${order.customerPostcode}`}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-xl md:text-2xl font-bold text-white">£{order.total.toFixed(2)}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'OUT_FOR_DELIVERY' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-yellow-500 text-black'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-3 md:mb-4">
                    <h4 className="text-white font-medium mb-2 text-sm md:text-base">Items:</h4>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-xs md:text-sm">
                          <span className="text-white/80">{item.quantity}x {item.name}</span>
                          <span className="text-white/60">£{item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <button
                      onClick={() => getDirectionsWithLocation(
                        order.customerAddress,
                        order.customerCity,
                        order.customerPostcode
                      )}
                      className="flex items-center space-x-1 md:space-x-2 px-3 py-2 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs md:text-sm"
                      title={`Get directions to: ${order.customerAddress}${order.customerCity ? `, ${order.customerCity}` : ''}${order.customerPostcode ? ` ${order.customerPostcode}` : ''}${currentLocation ? ' (from your current location)' : ''}`}
                    >
                      <Navigation className="w-3 h-3 md:w-4 md:h-4" />
                      <span>Get Directions</span>
                    </button>
                    
                    <button
                      onClick={() => window.open(`tel:${order.customerPhone}`, '_self')}
                      className="flex items-center space-x-1 md:space-x-2 px-3 py-2 md:px-4 md:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-xs md:text-sm"
                    >
                      <Phone className="w-3 h-3 md:w-4 md:h-4" />
                      <span>Call Customer</span>
                    </button>

                    {order.status === 'READY_FOR_PICKUP' && (
                      <button
                        onClick={() => acceptOrder(order.id)}
                        className="flex items-center space-x-1 md:space-x-2 px-3 py-2 md:px-4 md:py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-xs md:text-sm"
                      >
                        <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
                        <span>Accept Order</span>
                      </button>
                    )}

                    {order.status === 'OUT_FOR_DELIVERY' && (
                      <button
                        onClick={() => completeDelivery(order.id)}
                        className="flex items-center space-x-1 md:space-x-2 px-3 py-2 md:px-4 md:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-xs md:text-sm"
                      >
                        <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
                        <span>Complete Delivery</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Map */}
        {showMap && (
          <div className="w-full lg:w-1/2 p-3 md:p-6 flex flex-col min-h-0">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-white/20 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3 md:mb-4 flex-shrink-0">
                <h3 className="text-base md:text-lg font-semibold text-white">Live Location</h3>
                <button
                  onClick={() => setShowMap(false)}
                  className="text-white/70 hover:text-white transition-colors text-sm"
                  aria-label="Hide map"
                >
                  ✕
                </button>
              </div>
              {currentLocation ? (
                <div 
                  className="flex-1 w-full min-h-0" 
                  style={{ 
                    minHeight: '500px',
                    height: '100%',
                    width: '100%',
                    position: 'relative'
                  }}
                >
                  <LiveMap 
                    key={`map-${showMap}-${currentLocation.latitude}-${currentLocation.longitude}`}
                    currentLocation={currentLocation}
                    height="100%"
                    showControls={true}
                  />
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg h-[calc(100%-60px)] min-h-[400px] flex items-center justify-center">
                  <div className="text-center p-4">
                    <MapPin className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-3 md:mb-4" />
                    <p className="text-white text-base md:text-lg font-medium">Location Required</p>
                    <p className="text-white/70 text-sm mt-2 mb-3 md:mb-4">
                      Enable location access to see your position on the map
                    </p>
                    {locationError && (
                      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-3 md:mb-4 text-left max-w-md mx-auto">
                        <p className="text-red-200 text-xs whitespace-pre-line">{locationError}</p>
                      </div>
                    )}
                    <button
                      onClick={refreshLocation}
                      className="px-3 py-2 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Enable Location
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
} 