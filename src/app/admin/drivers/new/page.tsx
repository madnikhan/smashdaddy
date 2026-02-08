'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export default function NewDriverPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    vehicleInfo: '',
    isAvailable: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create user first
      const userResponse = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
        }),
      });

      let userId: string | undefined;
      if (userResponse.ok) {
        const userData = await userResponse.json();
        userId = userData.user?.id;
      }

      // Create the driver (API will create user if userId not provided)
      const driverResponse = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          phone: formData.phone,
          password: formData.password,
          vehicleInfo: formData.vehicleInfo,
          isAvailable: formData.isAvailable,
        }),
      });

      if (!driverResponse.ok) {
        const error = await driverResponse.json();
        throw new Error(error.error || 'Failed to create driver');
      }

      // Update user name and email if we created the user separately
      if (userId && formData.name && formData.email) {
        await fetch(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
          }),
        });
      }

      router.push('/admin');
    } catch (error) {
      console.error('Error creating driver:', error);
      alert(error instanceof Error ? error.message : 'Failed to create driver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-text">Add New Driver</h1>
          <p className="text-text-secondary mt-2">Create a new driver account</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(value) => setFormData({ ...formData, name: value })}
                placeholder="Driver name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Email *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
                placeholder="driver@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Phone Number *
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                placeholder="+44 123 456 7890"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Password *
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(value) => setFormData({ ...formData, password: value })}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Vehicle Information
              </label>
              <Input
                type="text"
                value={formData.vehicleInfo}
                onChange={(value) => setFormData({ ...formData, vehicleInfo: value })}
                placeholder="e.g., Red Ford Transit - AB12 CDE"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAvailable"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="h-4 w-4 text-secondary border-border rounded focus:ring-secondary"
              />
              <label htmlFor="isAvailable" className="ml-2 text-sm text-text">
                Available for deliveries
              </label>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Link href="/admin">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Driver
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

