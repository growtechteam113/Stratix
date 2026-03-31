'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

interface ContextData {
  company_overview: string;
  product_summary: string;
  ideal_customer_profile: string;
  pain_points: string[];
  jobs_to_be_done: string[];
  value_propositions: string[];
  messaging_pillars: string[];
  tone_of_voice: string;
  features: string[];
  use_cases: string[];
  proof_points: string[];
  market_category: string;
  competitors: string[];
  positioning_signals: string[];
  confidence_notes: string;
}

interface ContextVersion {
  versionNumber: number;
  status: string;
  generatedAt: string;
}

export default function ContextPage() {
  const { id: projectId } = useParams();
  const [context, setContext] = useState<ContextData | null>(null);
  const [versions, setVersions] = useState<ContextVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchContext();
    fetchVersions();
  }, [projectId]);

  const fetchContext = async () => {
    try {
      const response = await apiClient.get(
        `/projects/${projectId}/context/latest`,
      );
      if (response.data.data) {
        setContext(response.data.data.context);
        setSelectedVersion(response.data.data.versionNumber);
      }
    } catch (error) {
      console.error('Failed to fetch context:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    try {
      const response = await apiClient.get(
        `/projects/${projectId}/context/versions`,
      );
      setVersions(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch versions:', error);
    }
  };

  const handleGenerateContext = async () => {
    setIsGenerating(true);
    try {
      // For now, use a placeholder source text
      const sourceText = 'Sample business context from project sources';
      await apiClient.post(`/projects/${projectId}/context/generate`, {
        sourceText,
      });
      await fetchContext();
      await fetchVersions();
    } catch (error) {
      console.error('Failed to generate context:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishVersion = async (versionNumber: number) => {
    try {
      await apiClient.put(
        `/projects/${projectId}/context/version/${versionNumber}/publish`,
      );
      await fetchContext();
      await fetchVersions();
    } catch (error) {
      console.error('Failed to publish version:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading context...</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Context</h1>
        <p className="text-gray-600">
          Structured business intelligence extracted from your project sources.
        </p>
      </div>

      {!context ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-blue-900 mb-4">
            No context generated yet. Generate context from your project sources to get started.
          </p>
          <button
            onClick={handleGenerateContext}
            disabled={isGenerating}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate Context'}
          </button>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Version {selectedVersion}
              </h2>
              <button
                onClick={handleGenerateContext}
                disabled={isGenerating}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {isGenerating ? 'Generating...' : 'Generate New Version'}
              </button>
            </div>

            {versions.length > 1 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Version History</p>
                <div className="flex gap-2 flex-wrap">
                  {versions.map((v) => (
                    <button
                      key={v.versionNumber}
                      onClick={() => setSelectedVersion(v.versionNumber)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        selectedVersion === v.versionNumber
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      v{v.versionNumber} ({v.status})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContextCard title="Company Overview" content={context.company_overview} />
            <ContextCard title="Product Summary" content={context.product_summary} />
            <ContextCard title="Ideal Customer Profile" content={context.ideal_customer_profile} />
            <ContextCard title="Market Category" content={context.market_category} />
            <ContextCard title="Tone of Voice" content={context.tone_of_voice} />
            <ContextCard title="Confidence Notes" content={context.confidence_notes} />

            <ContextArrayCard title="Pain Points" items={context.pain_points} />
            <ContextArrayCard title="Jobs to Be Done" items={context.jobs_to_be_done} />
            <ContextArrayCard title="Value Propositions" items={context.value_propositions} />
            <ContextArrayCard title="Messaging Pillars" items={context.messaging_pillars} />
            <ContextArrayCard title="Features" items={context.features} />
            <ContextArrayCard title="Use Cases" items={context.use_cases} />
            <ContextArrayCard title="Proof Points" items={context.proof_points} />
            <ContextArrayCard title="Competitors" items={context.competitors} />
            <ContextArrayCard title="Positioning Signals" items={context.positioning_signals} />
          </div>
        </>
      )}
    </div>
  );
}

function ContextCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700 text-sm">{content}</p>
    </div>
  );
}

function ContextArrayCard({ title, items }: { title: string; items: string[] }) {
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
