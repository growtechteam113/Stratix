'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

interface ScoreCard {
  score: number;
  dimension_breakdown: {
    clarity: number;
    differentiation: number;
    market_viability: number;
    competitor_defense: number;
  };
  overall_justification: string;
  biggest_strengths: string[];
  biggest_weaknesses: string[];
  priority_improvements: string[];
}

export default function ScorecardPage() {
  const { id: projectId } = useParams();
  const [scoreCard, setScoreCard] = useState<ScoreCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchScoreCard();
  }, [projectId]);

  const fetchScoreCard = async () => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/strategy/score`);
      if (response.data.data?.scoreData) {
        setScoreCard(response.data.data.scoreData);
      }
    } catch (error) {
      console.error('Failed to fetch scorecard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateScore = async () => {
    setIsGenerating(true);
    try {
      await apiClient.post(`/projects/${projectId}/strategy/score/generate`);
      await fetchScoreCard();
    } catch (error) {
      console.error('Failed to generate score:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading scorecard...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Strategy Scorecard</h1>
            <p className="text-gray-600">
              Comprehensive evaluation of your market position and strategy.
            </p>
          </div>
          <button
            onClick={handleGenerateScore}
            disabled={isGenerating}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {isGenerating ? 'Generating...' : 'Generate Score'}
          </button>
        </div>
      </div>

      {!scoreCard ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-900 mb-4">
            No scorecard generated yet. Click "Generate Score" to evaluate your strategy.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Overall Score */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Overall Score</h2>
              <div className="text-6xl font-bold text-blue-600">{scoreCard.score}</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${(scoreCard.score / 20) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-4">Out of 20</p>
          </div>

          {/* Dimension Breakdown */}
          {scoreCard.dimension_breakdown && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Dimension Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(scoreCard.dimension_breakdown).map(([key, value]) => (
                  <div key={key} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {key.replace(/_/g, ' ')}
                      </h3>
                      <span className="text-lg font-bold text-blue-600">{value}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(value / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Justification */}
          {scoreCard.overall_justification && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Justification</h2>
              <p className="text-gray-700 leading-relaxed">{scoreCard.overall_justification}</p>
            </div>
          )}

          {/* Strengths */}
          {scoreCard.biggest_strengths && scoreCard.biggest_strengths.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-4">Biggest Strengths</h2>
              <ul className="space-y-2">
                {scoreCard.biggest_strengths.map((strength, idx) => (
                  <li key={idx} className="text-green-800 flex items-start">
                    <span className="text-green-600 mr-3">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {scoreCard.biggest_weaknesses && scoreCard.biggest_weaknesses.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-900 mb-4">Biggest Weaknesses</h2>
              <ul className="space-y-2">
                {scoreCard.biggest_weaknesses.map((weakness, idx) => (
                  <li key={idx} className="text-red-800 flex items-start">
                    <span className="text-red-600 mr-3">⚠</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Priority Improvements */}
          {scoreCard.priority_improvements && scoreCard.priority_improvements.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-900 mb-4">Priority Improvements</h2>
              <ol className="space-y-2">
                {scoreCard.priority_improvements.map((improvement, idx) => (
                  <li key={idx} className="text-yellow-800 flex items-start">
                    <span className="text-yellow-600 mr-3 font-semibold">{idx + 1}.</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4">
            <Link
              href={`/app/projects/${projectId}/strategy/brief`}
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 font-medium"
            >
              View Strategic Brief →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
