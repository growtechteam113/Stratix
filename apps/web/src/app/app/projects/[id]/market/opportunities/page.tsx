'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

interface OpportunityZone {
  saturatedAreas: Array<{
    area: string;
    reason: string;
    competitorCount: number;
    difficulty: 'high' | 'medium' | 'low';
  }>;
  whitespaceOpportunities: Array<{
    opportunity: string;
    targetAudience: string;
    estimatedDifficulty: 'high' | 'medium' | 'low';
    potentialValue: 'high' | 'medium' | 'low';
  }>;
  emergingTrends: Array<{
    trend: string;
    adoptionLevel: 'early' | 'growing' | 'mainstream';
    competitorsAdopting: string[];
  }>;
  narrativeOverlap: Array<{
    overlap: string;
    companies: string[];
    differentiationOpportunity: string;
  }>;
}

export default function OpportunitiesPage() {
  const { id: projectId } = useParams();
  const [opportunities, setOpportunities] = useState<OpportunityZone | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    fetchOpportunities();
  }, [projectId]);

  const fetchOpportunities = async () => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/market/opportunities`);
      if (response.data.data?.opportunities) {
        setOpportunities(response.data.data.opportunities);
      }
    } catch (error) {
      console.error('Failed to fetch opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectOpportunities = async () => {
    setIsDetecting(true);
    try {
      await apiClient.post(`/projects/${projectId}/market/opportunities/detect`);
      await fetchOpportunities();
    } catch (error) {
      console.error('Failed to detect opportunities:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading opportunities...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href={`/app/projects/${projectId}/market`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          ← Back to Category Map
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Market Opportunities</h1>
            <p className="text-gray-600">
              Discover whitespace, saturation areas, and emerging trends.
            </p>
          </div>
          <button
            onClick={handleDetectOpportunities}
            disabled={isDetecting}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {isDetecting ? 'Detecting...' : 'Detect Opportunities'}
          </button>
        </div>
      </div>

      {!opportunities ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-900 mb-4">
            No opportunities detected yet. Click "Detect Opportunities" to analyze the market.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {opportunities.whitespaceOpportunities && opportunities.whitespaceOpportunities.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Whitespace Opportunities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opportunities.whitespaceOpportunities.map((opp, idx) => (
                  <div
                    key={idx}
                    className="bg-green-50 border border-green-200 rounded-lg p-4"
                  >
                    <h3 className="font-semibold text-green-900 mb-2">{opp.opportunity}</h3>
                    <p className="text-sm text-green-800 mb-3">{opp.targetAudience}</p>
                    <div className="flex gap-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Difficulty: {opp.estimatedDifficulty}
                      </span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Value: {opp.potentialValue}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {opportunities.saturatedAreas && opportunities.saturatedAreas.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Saturated Areas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opportunities.saturatedAreas.map((area, idx) => (
                  <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-900 mb-2">{area.area}</h3>
                    <p className="text-sm text-red-800 mb-3">{area.reason}</p>
                    <div className="flex gap-2">
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        {area.competitorCount} competitors
                      </span>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Difficulty: {area.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {opportunities.emergingTrends && opportunities.emergingTrends.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Emerging Trends</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opportunities.emergingTrends.map((trend, idx) => (
                  <div
                    key={idx}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                  >
                    <h3 className="font-semibold text-yellow-900 mb-2">{trend.trend}</h3>
                    <p className="text-sm text-yellow-800 mb-3">
                      Adoption: {trend.adoptionLevel}
                    </p>
                    <p className="text-xs text-yellow-700">
                      Adopted by: {trend.competitorsAdopting.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {opportunities.narrativeOverlap && opportunities.narrativeOverlap.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Narrative Overlap</h2>
              <div className="grid grid-cols-1 gap-4">
                {opportunities.narrativeOverlap.map((overlap, idx) => (
                  <div
                    key={idx}
                    className="bg-purple-50 border border-purple-200 rounded-lg p-4"
                  >
                    <h3 className="font-semibold text-purple-900 mb-2">{overlap.overlap}</h3>
                    <p className="text-sm text-purple-800 mb-3">
                      Companies: {overlap.companies.join(', ')}
                    </p>
                    <p className="text-sm text-purple-700 font-medium">
                      Differentiation: {overlap.differentiationOpportunity}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
