'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

interface DashboardStats {
  totalUsers: number;
  activeProjects: number;
  totalSources: number;
  publishedReports: number;
  suspendedUsers: number;
  failedLogins: number;
  recentSignups: number;
  timestamp: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/admin/dashboard/stats');
        setStats(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Control Center</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="text-sm font-medium text-gray-600">Total Users</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalUsers}</div>
            <div className="text-xs text-gray-500 mt-2">{stats?.recentSignups} new this week</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="text-sm font-medium text-gray-600">Active Projects</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{stats?.activeProjects}</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="text-sm font-medium text-gray-600">Published Reports</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{stats?.publishedReports}</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="bg-red-50 text-sm font-medium text-red-600">Suspended Users</div>
            <div className="text-3xl font-bold text-red-900 mt-2">{stats?.suspendedUsers}</div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/app/admin/users">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-8 hover:shadow-lg transition-all cursor-pointer">
              <h2 className="text-xl font-semibold text-blue-900 mb-2">User Management</h2>
              <p className="text-blue-700">View and manage all users, suspend/restore accounts</p>
            </div>
          </Link>

          <Link href="/app/admin/activity">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-8 hover:shadow-lg transition-all cursor-pointer">
              <h2 className="text-xl font-semibold text-purple-900 mb-2">Activity Logs</h2>
              <p className="text-purple-700">View login history, user activity, and audit logs</p>
            </div>
          </Link>

          <Link href="/app/admin/jobs">
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-8 hover:shadow-lg transition-all cursor-pointer">
              <h2 className="text-xl font-semibold text-green-900 mb-2">Job Monitor</h2>
              <p className="text-green-700">Monitor ingestion jobs, retry failed jobs</p>
            </div>
          </Link>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">System Health</h2>
            <p className="text-gray-700">Total Sources: {stats?.totalSources}</p>
            <p className="text-gray-700">Failed Logins: {stats?.failedLogins}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
