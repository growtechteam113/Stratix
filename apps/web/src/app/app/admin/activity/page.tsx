'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';

interface LoginEvent {
  id: string;
  userId: string | null;
  status: string;
  createdAt: string;
  user?: { id: string; email: string; name: string };
}

interface LoginData {
  events: LoginEvent[];
  total: number;
  limit: number;
  offset: number;
}

export default function ActivityPage() {
  const [tab, setTab] = useState<'logins' | 'activity' | 'audit'>('logins');
  const [data, setData] = useState<LoginData | null>(null);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchData = async (newOffset: number = 0) => {
    try {
      let endpoint = '/admin/events/logins';
      if (tab === 'activity') endpoint = '/admin/events/activity';
      if (tab === 'audit') endpoint = '/admin/events/audit';

      const response = await apiClient.get(endpoint, {
        params: { limit: 50, offset: newOffset },
      });
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOffset(0);
    setLoading(true);
    fetchData(0);
  }, [tab]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Activity Logs</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {(['logins', 'activity', 'audit'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 font-semibold ${
                tab === t
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">Action</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.events.map((event: any) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                    {event.user?.email || event.userId || 'System'}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm text-gray-700">
                    {event.status || event.action || 'N/A'}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm text-gray-700">
                    {new Date(event.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setOffset(Math.max(0, offset - 50))}
            disabled={offset === 0}
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Showing {offset + 1} to {Math.min(offset + 50, data?.total)} of {data?.total}
          </span>
          <button
            onClick={() => setOffset(offset + 50)}
            disabled={!data || offset + 50 >= data.total}
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
