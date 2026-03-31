'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  name: string | null;
  globalRole: string;
  isSuspended: boolean;
  suspendedAt: string | null;
  createdAt: string;
  _count: {
    projects: number;
    loginEvents: number;
  };
}

interface UsersData {
  users: User[];
  total: number;
  limit: number;
  offset: number;
}

export default function UsersPage() {
  const [data, setData] = useState<UsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchUsers = async (newOffset: number = 0) => {
    try {
      const response = await apiClient.get('/admin/users', {
        params: { limit: 20, offset: newOffset },
      });
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(offset);
  }, [offset]);

  const handleSuspend = async (userId: string) => {
    try {
      await apiClient.put(`/admin/users/${userId}/suspend`, {
        reason: 'Suspended by admin',
      });
      fetchUsers(offset);
    } catch (error) {
      console.error('Failed to suspend user:', error);
    }
  };

  const handleRestore = async (userId: string) => {
    try {
      await apiClient.put(`/admin/users/${userId}/restore`);
      fetchUsers(offset);
    } catch (error) {
      console.error('Failed to restore user:', error);
    }
  };

  if (loading) return <div className="p-8">Loading users...</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">User Management</h1>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">Projects</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">Logins</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">Joined</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">{user.email}</td>
                  <td className="border border-gray-200 px-4 py-2 text-sm text-gray-700">{user.name || '-'}</td>
                  <td className="border border-gray-200 px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.globalRole === 'SUPERADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.globalRole}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.isSuspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">{user._count.projects}</td>
                  <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">{user._count.loginEvents}</td>
                  <td className="border border-gray-200 px-4 py-2 text-sm text-gray-700">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm">
                    {user.isSuspended ? (
                      <button
                        onClick={() => handleRestore(user.id)}
                        className="text-green-600 hover:text-green-800 font-semibold"
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSuspend(user.id)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setOffset(Math.max(0, offset - 20))}
            disabled={offset === 0}
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Showing {offset + 1} to {Math.min(offset + 20, data?.total)} of {data?.total}
          </span>
          <button
            onClick={() => setOffset(offset + 20)}
            disabled={!data || offset + 20 >= data.total}
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
