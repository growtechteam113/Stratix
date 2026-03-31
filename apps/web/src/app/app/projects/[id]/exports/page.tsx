'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

export default function ExportsPage() {
  const { id: projectId } = useParams();

  const handleExport = async (type: 'full' | 'context' | 'brief') => {
    try {
      const response = await apiClient.get(`/exports/projects/${projectId}/${type}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const timestamp = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `stratix-${type}-${timestamp}.json`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error(`Failed to export ${type}:`, error);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Export Center</h1>
        <p className="text-gray-600">Download your project data in various formats.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Full Export */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Full Project Export</h3>
          <p className="text-gray-600 mb-4">
            Download all project data including context, competitors, market analysis, and strategy.
          </p>
          <button
            onClick={() => handleExport('full')}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors font-medium"
          >
            Download JSON
          </button>
        </div>

        {/* Context Export */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Context</h3>
          <p className="text-gray-600 mb-4">
            Download your structured business context including company overview, pain points, and value propositions.
          </p>
          <button
            onClick={() => handleExport('context')}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors font-medium"
          >
            Download JSON
          </button>
        </div>

        {/* Brief Export */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Strategic Brief</h3>
          <p className="text-gray-600 mb-4">
            Download your strategic brief with market analysis, competitor insights, and recommendations.
          </p>
          <button
            onClick={() => handleExport('brief')}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors font-medium"
          >
            Download JSON
          </button>
        </div>
      </div>

      {/* Print Instructions */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Print to PDF</h3>
        <p className="text-blue-800 mb-4">
          To export any page as a PDF, use your browser's print function (Cmd+P or Ctrl+P) and select "Save as PDF".
        </p>
        <p className="text-sm text-blue-700">
          This works best on the Strategic Brief and Scorecard pages for professional-looking documents.
        </p>
      </div>
    </div>
  );
}
