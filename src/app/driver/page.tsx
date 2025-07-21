'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

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
      console.log('=== Geolocation Debug Info ===');
      console.log('Browser:', navigator.userAgent);
      console.log('Secure Context:', window.isSecureContext);
      console.log('Protocol:', window.location.protocol);
      console.log('Hostname:', window.location.hostname);
      console.log('Geolocation Supported:', !!navigator.geolocation);
      console.log('Permissions API Supported:', !!navigator.permissions);
      console.log('================================');
      
      // Check if we're in a secure context (HTTPS is required for geolocation)
      if (!window.isSecureContext) {
        console.log('Not in secure context - HTTPS required for geolocation');
        // Allow localhost in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          console.log('Localhost detected - allowing geolocation');
        } else {
          setLocationError('Location access requires HTTPS. Please access this page via HTTPS.');
          return;
        }
      }
      
      if (!navigator.geolocation) {
        console.log('Geolocation not supported by browser');
        setLocationError('Geolocation is not supported by this browser. Please use a modern browser.');
        return;
      }

      console.log('Geolocation supported, requesting position...');

      // Check permission status if available
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          console.log('Geolocation permission status:', result.state);
          if (result.state === 'denied') {
            setLocationError('Location access is blocked. Please enable location access in your browser settings.');
            return;
          }
        }).catch((error) => {
          console.log('Permission query failed:', error);
        });
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location obtained successfully:', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp).toISOString()
          });
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          setLocationError(null);
          
          // Update location on server
          updateLocationOnServer(latitude, longitude, position.coords.accuracy);
        },
        (error) => {
          console.error('Geolocation error details:', {
            code: error.code,
            message: error.message,
            PERMISSION_DENIED: error.PERMISSION_DENIED,
            POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
            TIMEOUT: error.TIMEOUT,
            browser: navigator.userAgent,
            secureContext: window.isSecureContext,
            hostname: window.location.hostname,
            protocol: window.location.protocol
          });
          
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
              errorMessage += 'Location request timed out. Please try again.';
              detailedHelp = 'Check your internet connection and try again.';
              break;
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
    
    // Set up periodic location updates (every 30 seconds)
    const interval = setInterval(getCurrentLocation, 30000);
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
      console.log('Manual location refresh requested...');
      
      // Try with high accuracy first
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Manual location refresh successful:', position);
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          setLocationError(null);
          updateLocationOnServer(latitude, longitude, position.coords.accuracy);
        },
        (error) => {
          console.log('High accuracy location failed, trying with lower accuracy...');
          
          // Fallback to lower accuracy
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('Lower accuracy location successful:', position);
              const { latitude, longitude } = position.coords;
              setCurrentLocation({ latitude, longitude });
              setLocationError(null);
              updateLocationOnServer(latitude, longitude, position.coords.accuracy);
            },
            (fallbackError) => {
              console.error('Both high and low accuracy location failed:', {
                highAccuracyError: error,
                lowAccuracyError: fallbackError
              });
              
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
      });

      if (!response.ok) {
        console.error('Failed to update location on server:', response.status, response.statusText);
        return;
      }

      const data = await response.json();
      if (!data.success) {
        console.error('Server returned error:', data.error);
      }
    } catch (error) {
      console.error('Error updating location on server:', error);
    }
  };

  // Fetch driver data and orders
  useEffect(() => {
    if (!driver) return;

    const fetchDriverData = async () => {
      try {
        // Fetch orders for this driver
        const response = await fetch('/api/orders?status=OUT_FOR_DELIVERY&limit=20');
        
        if (!response.ok) {
          console.error('Failed to fetch orders:', response.status, response.statusText);
          return;
        }

        const data = await response.json();
        
        if (data.success) {
          // Filter orders that are assigned to this driver or available for pickup
          const driverOrders = data.orders.filter((order: Order) => 
            order.status === 'OUT_FOR_DELIVERY' || 
            order.status === 'READY_FOR_PICKUP'
          );
          setOrders(driverOrders);
        } else {
          console.error('Failed to fetch orders:', data.error);
        }
      } catch (error) {
        console.error('Error fetching driver data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchDriverData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
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
        // Get the updated driver data from the response
        const data = await response.json();
        if (data.success) {
          // Update state with the server response
          setIsAvailable(data.driver.isAvailable);
          setDriver(data.driver);
          // Update localStorage with the fresh data
          localStorage.setItem('driverData', JSON.stringify(data.driver));
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
        const ordersData = await ordersResponse.json();
        if (ordersData.success) {
          setOrders(ordersData.orders);
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
        const ordersData = await ordersResponse.json();
        if (ordersData.success) {
          setOrders(ordersData.orders);
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
  const getDirectionsWithLocation = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    
    if (!currentLocation) {
      // Fallback to basic directions without current location
      console.log('No current location available, using basic directions');
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
      return;
    }
    
    const { latitude, longitude } = currentLocation;
    
    // Use Google Maps with current location
    console.log('Using current location for directions:', { latitude, longitude, address });
    window.open(`https://www.google.com/maps/dir/${latitude},${longitude}/${encodedAddress}`, '_blank');
  };

  // Test geolocation function for debugging
  const testGeolocation = () => {
    console.log('=== Testing Geolocation ===');
    console.log('navigator.geolocation:', !!navigator.geolocation);
    console.log('window.isSecureContext:', window.isSecureContext);
    console.log('window.location.protocol:', window.location.protocol);
    console.log('window.location.hostname:', window.location.hostname);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('✅ Geolocation test successful:', position.coords);
        },
        (error) => {
          console.log('❌ Geolocation test failed:', {
            code: error.code,
            message: error.message
          });
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
                      <p className="text-white/70 text-xs md:text-sm">{order.customerAddress}</p>
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
                      onClick={() => getDirectionsWithLocation(order.customerAddress)}
                      className="flex items-center space-x-1 md:space-x-2 px-3 py-2 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs md:text-sm"
                      title={`Get directions to: ${order.customerAddress}${currentLocation ? ' (from your current location)' : ''}`}
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
          <div className="w-full lg:w-1/2 p-3 md:p-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-white/20 h-full">
              <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4">Live Location</h3>
              {currentLocation ? (
                <LiveMap 
                  currentLocation={currentLocation}
                  height="calc(100% - 60px)"
                  showControls={true}
                />
              ) : (
                <div className="bg-gray-800 rounded-lg h-[calc(100%-60px)] flex items-center justify-center">
                  <div className="text-center p-4">
                    <MapPin className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-3 md:mb-4" />
                    <p className="text-white text-base md:text-lg font-medium">Location Required</p>
                    <p className="text-white/70 text-sm mt-2 mb-3 md:mb-4">
                      Enable location access to see your position on the map
                    </p>
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
  );
} 