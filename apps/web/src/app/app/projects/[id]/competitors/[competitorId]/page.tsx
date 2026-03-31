'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

interface CompetitorDetail {
  id: string;
  name: string;
  website?: string;
  status: string;
  insight?: {
    insightData: {
      company: string;
      positioning: string;
      value_propositions: string[];
      target_audience: string;
      messaging_style: string;
      key_claims: string[];
      strengths: string[];
      weaknesses: string[];
      differentiation_clues: string[];
      threat_indicators: string[];
      confidence_notes: string;
    };
  };
  sources: any[];
}

export default function CompetitorDetailPage() {
  const { id: projectId, competitorId } = useParams();
  const [competitor, setCompetitor] = useState<CompetitorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchCompetitorDetail();
  }, [projectId, competitorId]);

  const fetchCompetitorDetail = async () => {
    try {
      const response = await apiClient.get(
        `/projects/${projectId}/competitors/${competitorId}`,
      );
      setCompetitor(response.data.data);
    } catch (error) {
      console.error('Failed to fetch competitor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeCompetitor = async () => {
    setIsAnalyzing(true);
    try {
      await apiClient.post(
        `/projects/${projectId}/competitors/${competitorId}/analyze`,
      );
      await fetchCompetitorDetail();
    } catch (error) {
      console.error('Failed to analyze competitor:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading competitor...</p>
      </div>
    );
  }

  if (!competitor) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Competitor not found.</p>
      </div>
    );
  }

  const insight = competitor.insight?.insightData;

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href={`/app/projects/${projectId}/competitors`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          ← Back to Competitors
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {competitor.name}
            </h1>
            {competitor.website && (
              <p className="text-gray-600">
                <a
                  href={competitor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {competitor.website}
                </a>
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                competitor.status === 'ANALYZED'
                  ? 'bg-green-100 text-green-800'
                  : competitor.status === 'ANALYZING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
              }`}
            >
              {competitor.status}
            </span>
            <button
              onClick={handleAnalyzeCompetitor}
              disabled={isAnalyzing}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
            </button>
          </div>
        </div>
      </div>

      {!insight ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-blue-900 mb-4">
            No analysis available yet. Click "Re-analyze" to generate competitive intelligence.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InsightCard title="Positioning" content={insight.positioning} />
          <InsightCard title="Target Audience" content={insight.target_audience} />
          <InsightCard title="Messaging Style" content={insight.messaging_style} />
          <InsightCard title="Confidence Notes" content={insight.confidence_notes} />

          <InsightArrayCard title="Value Propositions" items={insight.value_propositions} />
          <InsightArrayCard title="Key Claims" items={insight.key_claims} />
          <InsightArrayCard title="Strengths" items={insight.strengths} />
          <InsightArrayCard title="Weaknesses" items={insight.weaknesses} />
          <InsightArrayCard
            title="Differentiation Clues"
            items={insight.differentiation_clues}
          />
          <InsightArrayCard title="Threat Indicators" items={insight.threat_indicators} />
        </div>
      )}

      {competitor.sources && competitor.sources.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sources</h2>
          <div className="space-y-2">
            {competitor.sources.map((source, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-200 rounded p-3">
                {source.sourceUrl && (
                  <a
                    href={source.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {source.sourceUrl}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InsightCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700 text-sm">{content}</p>
    </div>
  );
}

function InsightArrayCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="text-gray-700 text-sm flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
