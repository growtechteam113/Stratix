'use client';

import { useAuthStore } from '@/lib/auth-store';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, activeWorkspace } = useAuthStore();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome, {user?.name || user?.email}!
        </h1>
        <p className="text-lg text-gray-600">
          You're in <span className="font-semibold">{activeWorkspace?.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Projects</h2>
          <p className="text-gray-600 mb-4">Manage your competitive intelligence projects</p>
          <Link
            href="/app/projects"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Projects
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile</h2>
          <p className="text-gray-600 mb-4">Manage your account settings</p>
          <Link
            href="/app/profile"
            className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            View Profile
          </Link>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Getting Started</h2>
        <p className="text-gray-700 mb-4">
          STRATIX AI helps you discover competitive intelligence and develop winning positioning strategies.
        </p>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">1.</span>
            <span>Create a new project to start analyzing competitors</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">2.</span>
            <span>Add sources (URLs, files) to ingest competitor data</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">3.</span>
            <span>Let AI analyze and generate strategic insights</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
