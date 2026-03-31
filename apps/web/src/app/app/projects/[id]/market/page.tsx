'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

interface Segment {
  name: string;
  description: string;
  characteristics: string[];
  competitors: string[];
  saturationLevel: 'high' | 'medium' | 'low';
}

interface CategoryMap {
  segments: {
    segments: Segment[];
    ourProjectPosition: {
      segment: string;
      rationale: string;
    };
  };
  generatedAt: string;
}

export default function MarketPage() {
  const { id: projectId } = useParams();
  const [categoryMap, setCategoryMap] = useState<CategoryMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchCategoryMap();
  }, [projectId]);

  const fetchCategoryMap = async () => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/market/category-map`);
      if (response.data.data) {
        setCategoryMap(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch category map:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCategoryMap = async () => {
    setIsGenerating(true);
    try {
      await apiClient.post(`/projects/${projectId}/market/category-map/generate`);
      await fetchCategoryMap();
    } catch (error) {
      console.error('Failed to generate category map:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading market analysis...</p>
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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Market Category Map</h1>
            <p className="text-gray-600">
              Understand the competitive landscape and market segments.
            </p>
          </div>
          <button
            onClick={handleGenerateCategoryMap}
            disabled={isGenerating}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {isGenerating ? 'Generating...' : 'Generate Map'}
          </button>
        </div>
      </div>

      {!categoryMap ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-900 mb-4">
            No category map generated yet. Click "Generate Map" to analyze the market segments.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {categoryMap.segments?.segments && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Market Segments</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categoryMap.segments.segments.map((segment, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{segment.name}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          segment.saturationLevel === 'high'
                            ? 'bg-red-100 text-red-800'
                            : segment.saturationLevel === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {segment.saturationLevel.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-4">{segment.description}</p>
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Characteristics:</p>
                      <div className="flex flex-wrap gap-2">
                        {segment.characteristics.map((char, cidx) => (
                          <span
                            key={cidx}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                          >
                            {char}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        Competitors ({segment.competitors.length}):
                      </p>
                      <div className="space-y-1">
                        {segment.competitors.map((comp, cidx) => (
                          <p key={cidx} className="text-gray-700 text-sm">
                            • {comp}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {categoryMap.segments?.ourProjectPosition && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Position</h2>
              <p className="text-lg font-medium text-blue-900 mb-2">
                {categoryMap.segments.ourProjectPosition.segment}
              </p>
              <p className="text-gray-700">
                {categoryMap.segments.ourProjectPosition.rationale}
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <Link
              href={`/app/projects/${projectId}/market/opportunities`}
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 font-medium"
            >
              View Opportunities →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
