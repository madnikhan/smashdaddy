'use client';

import { useState } from 'react';
import { Truck, User, Phone, Eye, EyeOff, Lock } from 'lucide-react';

interface DriverRegistration {
  userId?: string;
  phone: string;
  password: string;
  confirmPassword: string;
  vehicleType: string;
  vehicleModel: string;
  vehicleColor: string;
  licensePlate?: string;
}

export default function DriverRegistration() {
  const [formData, setFormData] = useState<DriverRegistration>({
    userId: '',
    phone: '',
    password: '',
    confirmPassword: '',
    vehicleType: 'car',
    vehicleModel: '',
    vehicleColor: '',
    licensePlate: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof DriverRegistration, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const vehicleInfo = {
        type: formData.vehicleType,
        model: formData.vehicleModel,
        color: formData.vehicleColor,
        licensePlate: formData.licensePlate,
      };

      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: formData.userId || undefined, // Send undefined if empty
          phone: formData.phone,
          password: formData.password, // Include password
          vehicleInfo,
          isAvailable: false, // Start as unavailable
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to register driver');
      }
    } catch (error) {
      console.error('Error registering driver:', error);
      setError('Failed to register driver. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-700 mb-6">
              Your driver account has been created successfully. You can now log in and start accepting delivery orders.
            </p>
            <div className="space-y-3">
              <a
                href="/driver/login"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Go to Login
              </a>
              <div className="text-sm text-gray-600">
                Use your phone number and password to log in
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 border border-gray-200">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
            <Truck className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Driver Registration</h2>
          <p className="text-gray-700">
            Join our delivery team and start earning with STACK'D
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User ID (Optional) */}
          <div>
            <label htmlFor="userId" className="block text-sm font-semibold text-gray-800 mb-2">
              User ID (Optional)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                id="userId"
                value={formData.userId}
                onChange={(e) => handleInputChange('userId', e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-500"
                placeholder="Enter your user ID (optional)"
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Leave blank to create a new user account automatically
            </p>
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-500"
                placeholder="+44 7700 900000"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-500"
                placeholder="Create a password (min 6 characters)"
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

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-500"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Vehicle Type *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'car', label: 'Car', icon: Truck },
                { value: 'motorcycle', label: 'Motorcycle', icon: Truck },
                { value: 'bike', label: 'Bike', icon: Truck },
              ].map((vehicle) => (
                <button
                  key={vehicle.value}
                  type="button"
                  onClick={() => handleInputChange('vehicleType', vehicle.value)}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all ${
                    formData.vehicleType === vehicle.value
                      ? 'border-primary bg-primary/10 text-primary shadow-md'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <vehicle.icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{vehicle.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Model */}
          <div>
            <label htmlFor="vehicleModel" className="block text-sm font-semibold text-gray-800 mb-2">
              Vehicle Model *
            </label>
            <input
              type="text"
              id="vehicleModel"
              value={formData.vehicleModel}
              onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-500"
              placeholder="e.g., Ford Focus, Honda Civic"
              required
            />
          </div>

          {/* Vehicle Color */}
          <div>
            <label htmlFor="vehicleColor" className="block text-sm font-semibold text-gray-800 mb-2">
              Vehicle Color *
            </label>
            <input
              type="text"
              id="vehicleColor"
              value={formData.vehicleColor}
              onChange={(e) => handleInputChange('vehicleColor', e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-500"
              placeholder="e.g., White, Black, Red"
              required
            />
          </div>

          {/* License Plate (Optional) */}
          <div>
            <label htmlFor="licensePlate" className="block text-sm font-semibold text-gray-800 mb-2">
              License Plate (Optional)
            </label>
            <input
              type="text"
              id="licensePlate"
              value={formData.licensePlate}
              onChange={(e) => handleInputChange('licensePlate', e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-500"
              placeholder="e.g., AB12 CDE"
            />
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
                Registering...
              </>
            ) : (
              <>
                <Truck className="h-4 w-4 mr-2" />
                Register as Driver
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/driver/login" className="text-primary hover:text-primary-dark font-medium">
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 