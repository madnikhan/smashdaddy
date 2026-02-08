'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Filter, Trash2, Mail, User as UserIcon, Shield, Truck, ChefHat } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import InstallPrompt from '@/components/InstallPrompt';

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: Date | null;
  createdAt: string;
  roles: {
    customer: boolean;
    driver: boolean;
    restaurant: boolean;
    admin: boolean;
  };
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      const url = roleFilter !== 'all' 
        ? `/api/admin/users?role=${roleFilter}`
        : '/api/admin/users';
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.users);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const getRoleBadges = (roles: User['roles']) => {
    const badges = [];
    if (roles.admin) badges.push({ label: 'Admin', icon: Shield, color: 'bg-purple-500/20 text-purple-400' });
    if (roles.driver) badges.push({ label: 'Driver', icon: Truck, color: 'bg-blue-500/20 text-blue-400' });
    if (roles.restaurant) badges.push({ label: 'Restaurant', icon: ChefHat, color: 'bg-orange-500/20 text-orange-400' });
    if (roles.customer) badges.push({ label: 'Customer', icon: UserIcon, color: 'bg-green-500/20 text-green-400' });
    return badges;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <>
      <InstallPrompt />
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="mb-4">
                ← Back to Admin
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-text">User Management</h1>
            <p className="text-text-secondary mt-2">Manage all system users</p>
          </div>

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-tertiary border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 bg-tertiary border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option value="all">All Roles</option>
                  <option value="customer">Customers</option>
                  <option value="driver">Drivers</option>
                  <option value="restaurant">Restaurants</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Users Table */}
          <Card className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
                <p className="text-text-secondary">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                <p className="text-text-secondary">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">Email</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">Roles</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">Verified</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">Created</th>
                      <th className="text-right py-3 px-4 text-text-secondary font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const roleBadges = getRoleBadges(user.roles);
                      return (
                        <tr key={user.id} className="border-b border-border hover:bg-tertiary/50">
                          <td className="py-3 px-4 text-text">
                            <div className="flex items-center">
                              {user.image ? (
                                <img src={user.image} alt={user.name || ''} className="h-8 w-8 rounded-full mr-2" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center mr-2">
                                  <UserIcon className="h-4 w-4 text-secondary" />
                                </div>
                              )}
                              <span>{user.name || 'No name'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-text-secondary">{user.email}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {roleBadges.length > 0 ? (
                                roleBadges.map((badge, idx) => {
                                  const Icon = badge.icon;
                                  return (
                                    <span
                                      key={idx}
                                      className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${badge.color}`}
                                    >
                                      <Icon className="h-3 w-3" />
                                      {badge.label}
                                    </span>
                                  );
                                })
                              ) : (
                                <span className="text-text-secondary text-sm">No roles</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {user.emailVerified ? (
                              <span className="text-green-400 text-sm">✓ Verified</span>
                            ) : (
                              <span className="text-text-secondary text-sm">Not verified</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-text-secondary text-sm">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <div className="mt-4 text-sm text-text-secondary">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </div>
    </>
  );
}

