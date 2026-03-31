'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

interface Competitor {
  id: string;
  name: string;
  website?: string;
  status: string;
  createdAt: string;
  insight?: any;
}

export default function CompetitorsPage() {
  const { id: projectId } = useParams();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCompetitorName, setNewCompetitorName] = useState('');
  const [newCompetitorWebsite, setNewCompetitorWebsite] = useState('');

  useEffect(() => {
    fetchCompetitors();
  }, [projectId]);

  const fetchCompetitors = async () => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/competitors`);
      setCompetitors(response.data.data.competitors || []);
    } catch (error) {
      console.error('Failed to fetch competitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscoverCompetitors = async () => {
    setIsDiscovering(true);
    try {
      await apiClient.post(`/projects/${projectId}/competitors/discover`);
      await fetchCompetitors();
    } catch (error) {
      console.error('Failed to discover competitors:', error);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompetitorName.trim()) return;

    try {
      await apiClient.post(`/projects/${projectId}/competitors/add`, {
        name: newCompetitorName,
        website: newCompetitorWebsite || undefined,
      });
      setNewCompetitorName('');
      setNewCompetitorWebsite('');
      setShowAddForm(false);
      await fetchCompetitors();
    } catch (error) {
      console.error('Failed to add competitor:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading competitors...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href={`/app/projects/${projectId}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          ← Back to Project
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Competitors</h1>
        <p className="text-gray-600">
          Discover and analyze market competitors to understand your competitive landscape.
        </p>
      </div>

      <div className="mb-8 flex gap-4">
        <button
          onClick={handleDiscoverCompetitors}
          disabled={isDiscovering}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {isDiscovering ? 'Discovering...' : 'Auto-Discover Competitors'}
        </button>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gray-200 text-gray-900 px-6 py-2 rounded hover:bg-gray-300 font-medium"
        >
          {showAddForm ? 'Cancel' : 'Add Competitor Manually'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <form onSubmit={handleAddCompetitor}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Competitor Name
              </label>
              <input
                type="text"
                value={newCompetitorName}
                onChange={(e) => setNewCompetitorName(e.target.value)}
                placeholder="e.g., Salesforce"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website (Optional)
              </label>
              <input
                type="url"
                value={newCompetitorWebsite}
                onChange={(e) => setNewCompetitorWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
            >
              Add Competitor
            </button>
          </form>
        </div>
      )}

      {competitors.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">No competitors added yet.</p>
          <p className="text-gray-500 text-sm">
            Click "Auto-Discover Competitors" to find competitors in your market, or add them manually.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitors.map((competitor) => (
            <Link
              key={competitor.id}
              href={`/app/projects/${projectId}/competitors/${competitor.id}`}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {competitor.name}
              </h3>
              {competitor.website && (
                <p className="text-sm text-gray-600 mb-3 truncate">
                  {competitor.website}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    competitor.status === 'ANALYZED'
                      ? 'bg-green-100 text-green-800'
                      : competitor.status === 'ANALYZING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {competitor.status}
                </span>
                {competitor.insight && (
                  <span className="text-green-600 text-sm font-medium">✓ Analyzed</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
