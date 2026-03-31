'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { GlowingHeading } from '@/components/ui/glowing-heading';

interface PublicReportData {
  project: {
    name: string;
    description: string;
  };
  positioning?: { statementData: any };
  scoreCard?: { scoreData: any };
  strategicBrief?: { briefData: any };
}

export default function PublicReportPage() {
  const { slug } = useParams();
  const [report, setReport] = useState<PublicReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await apiClient.get(`/reports/public/${slug}`);
        if (response.data.data?.project) {
          setReport(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch report:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchReport();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Loading report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Report not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-8 py-16 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <GlowingHeading level="h1" className="mb-4">
            {report.project.name}
          </GlowingHeading>
          {report.project.description && (
            <p className="text-lg text-gray-600">{report.project.description}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-16 max-w-4xl mx-auto">
        {/* Score Section */}
        {report.scoreCard?.scoreData && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Strategy Score</h2>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">Overall Score</h3>
                <div className="text-6xl font-bold text-blue-600">
                  {report.scoreCard.scoreData.score}
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {report.scoreCard.scoreData.overall_justification}
              </p>
            </div>
          </section>
        )}

        {/* Positioning Section */}
        {report.positioning?.statementData && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Positioning</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed">
                {report.positioning.statementData.positioning_statement}
              </p>
            </div>
          </section>
        )}

        {/* Strategic Brief Section */}
        {report.strategicBrief?.briefData && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Strategic Brief</h2>
            <div className="space-y-8">
              {report.strategicBrief.briefData.executive_summary && (
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Executive Summary</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {report.strategicBrief.briefData.executive_summary}
                  </p>
                </div>
              )}

              {report.strategicBrief.briefData.market_landscape && (
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Market Landscape</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {report.strategicBrief.briefData.market_landscape}
                  </p>
                </div>
              )}

              {report.strategicBrief.briefData.strategic_recommendations && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Strategic Recommendations
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {report.strategicBrief.briefData.strategic_recommendations}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-8 py-12 text-center text-gray-600">
        <p>&copy; 2024 STRATIX AI. Strategic Intelligence Platform.</p>
      </footer>
    </div>
  );
}
