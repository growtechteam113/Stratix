'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

interface StrategicBrief {
  executive_summary: string;
  market_landscape: string;
  competitor_analysis: string;
  opportunity_mapping: string;
  positioning_strategy: string;
  strategic_recommendations: string;
}

export default function BriefPage() {
  const { id: projectId } = useParams();
  const [brief, setBrief] = useState<StrategicBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchBrief();
  }, [projectId]);

  const fetchBrief = async () => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/strategy/brief`);
      if (response.data.data?.briefData) {
        setBrief(response.data.data.briefData);
      }
    } catch (error) {
      console.error('Failed to fetch brief:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBrief = async () => {
    setIsGenerating(true);
    try {
      await apiClient.post(`/projects/${projectId}/strategy/brief/generate`);
      await fetchBrief();
    } catch (error) {
      console.error('Failed to generate brief:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading strategic brief...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Strategic Brief</h1>
            <p className="text-gray-600">
              Comprehensive strategic analysis and recommendations.
            </p>
          </div>
          <button
            onClick={handleGenerateBrief}
            disabled={isGenerating}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {isGenerating ? 'Generating...' : 'Generate Brief'}
          </button>
        </div>
      </div>

      {!brief ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-900 mb-4">
            No strategic brief generated yet. Click "Generate Brief" to create a comprehensive analysis.
          </p>
        </div>
      ) : (
        <div className="space-y-12 max-w-4xl">
          {/* Executive Summary */}
          {brief.executive_summary && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Executive Summary</h2>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {brief.executive_summary}
                </p>
              </div>
            </section>
          )}

          {/* Market Landscape */}
          {brief.market_landscape && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Market Landscape</h2>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {brief.market_landscape}
                </p>
              </div>
            </section>
          )}

          {/* Competitor Analysis */}
          {brief.competitor_analysis && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Competitor Analysis</h2>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {brief.competitor_analysis}
                </p>
              </div>
            </section>
          )}

          {/* Opportunity Mapping */}
          {brief.opportunity_mapping && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Opportunity Mapping</h2>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {brief.opportunity_mapping}
                </p>
              </div>
            </section>
          )}

          {/* Positioning Strategy */}
          {brief.positioning_strategy && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Positioning Strategy</h2>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {brief.positioning_strategy}
                </p>
              </div>
            </section>
          )}

          {/* Strategic Recommendations */}
          {brief.strategic_recommendations && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Strategic Recommendations</h2>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {brief.strategic_recommendations}
                </p>
              </div>
            </section>
          )}

          {/* Navigation */}
          <div className="flex gap-4 pt-8 border-t border-gray-200">
            <Link
              href={`/app/projects/${projectId}/strategy/scorecard`}
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 font-medium"
            >
              ← View Scorecard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
