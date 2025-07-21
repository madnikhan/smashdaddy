'use client';

import { useState } from 'react';
import { Truck, Phone, User, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DriverLogin {
  identifier: string; // phone number or user ID
  password: string;
}

export default function DriverLogin() {
  const [formData, setFormData] = useState<DriverLogin>({
    identifier: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (field: keyof DriverLogin, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate credentials by sending both phone and password
      // Properly encode the phone number to handle + characters
      const response = await fetch(`/api/drivers?phone=${encodeURIComponent(formData.identifier)}&password=${encodeURIComponent(formData.password)}`);
      const data = await response.json();

      if (data.success && data.drivers.length > 0) {
        // Found driver and password is valid - store in localStorage and redirect
        const driver = data.drivers[0];
        localStorage.setItem('driverData', JSON.stringify(driver));
        router.push('/driver');
      } else {
        setError('Invalid phone number or password. Please check your credentials.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Failed to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 border border-gray-200">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
            <Truck className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Driver Login</h2>
          <p className="text-gray-700">
            Sign in to your driver account
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Phone Number */}
          <div>
            <label htmlFor="identifier" className="block text-sm font-semibold text-gray-800 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                id="identifier"
                value={formData.identifier}
                onChange={(e) => handleInputChange('identifier', e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-500"
                placeholder="Enter your phone number"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
              Password
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-500"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-base"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing In...
              </>
            ) : (
              <>
                <Truck className="h-4 w-4 mr-2" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/driver/register" className="text-primary hover:text-primary-dark font-medium">
              Register as Driver
            </a>
          </p>
          <p className="text-xs text-gray-500">
            Use the phone number and password you created during registration
          </p>
        </div>
      </div>
    </div>
  );
} 