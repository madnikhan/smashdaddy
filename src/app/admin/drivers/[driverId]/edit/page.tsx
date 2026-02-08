'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import InstallPrompt from '@/components/InstallPrompt';

export default function EditDriverPage() {
  const params = useParams();
  const router = useRouter();
  const driverId = params?.driverId as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleInfo: '',
    isAvailable: false,
  });

  useEffect(() => {
    if (driverId) {
      fetchDriver();
    }
  }, [driverId]);

  const fetchDriver = async () => {
    try {
      const response = await fetch(`/api/drivers/${driverId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.driver) {
          const driver = data.driver;
          // Format vehicleInfo - handle both object and string
          let vehicleInfoString = '';
          if (driver.vehicleInfo) {
            if (typeof driver.vehicleInfo === 'object') {
              vehicleInfoString = `${driver.vehicleInfo.type || ''} ${driver.vehicleInfo.model || ''} ${driver.vehicleInfo.color || ''} ${driver.vehicleInfo.licensePlate || ''}`.trim();
            } else {
              vehicleInfoString = driver.vehicleInfo;
            }
          }
          
          setFormData({
            name: driver.user?.name || '',
            email: driver.user?.email || '',
            phone: driver.phone || '',
            vehicleInfo: vehicleInfoString,
            isAvailable: driver.isAvailable || false,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching driver:', error);
      alert('Failed to load driver details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update driver
      const driverResponse = await fetch(`/api/admin/drivers/${driverId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          vehicleInfo: formData.vehicleInfo,
          isAvailable: formData.isAvailable,
        }),
      });

      if (!driverResponse.ok) {
        const error = await driverResponse.json();
        throw new Error(error.error || 'Failed to update driver');
      }

      // Update user info if changed
      const driverData = await driverResponse.json();
      if (driverData.driver?.userId) {
        await fetch(`/api/admin/users/${driverData.driver.userId}`, {
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
      console.error('Error updating driver:', error);
      alert(error instanceof Error ? error.message : 'Failed to update driver');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading driver details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <InstallPrompt />
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-text">Edit Driver</h1>
            <p className="text-text-secondary mt-2">Update driver information</p>
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
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}

