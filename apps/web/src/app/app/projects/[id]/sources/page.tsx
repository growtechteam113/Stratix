'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { SourceStatus } from '@/components/sources/source-status';

interface Source {
  id: string;
  type: 'URL' | 'FILE';
  title: string;
  sourceUrl?: string;
  mimeType?: string;
  status: string;
  createdAt: string;
}

export default function SourcesPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // URL form state
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [isAddingUrl, setIsAddingUrl] = useState(false);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchSources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const fetchSources = async () => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/sources`);
      setSources(response.data.data.sources);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sources');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAddingUrl(true);

    try {
      const response = await apiClient.post(
        `/projects/${projectId}/sources/url`,
        {
          url: urlInput,
          title: urlTitle || urlInput,
        },
      );

      setSources([response.data.data, ...sources]);
      setUrlInput('');
      setUrlTitle('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add URL');
    } finally {
      setIsAddingUrl(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await apiClient.post(
        `/projects/${projectId}/sources/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      setSources([response.data.data, ...sources]);
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    if (!confirm('Are you sure you want to delete this source?')) return;

    try {
      await apiClient.delete(`/projects/${projectId}/sources/${sourceId}`);
      setSources(sources.filter((s) => s.id !== sourceId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete source');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/app/projects/${projectId}`} className="text-blue-600 hover:underline text-sm mb-4 inline-block">
          ← Back to Project
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Source Management</h1>
        <p className="text-gray-600 mt-2">Add URLs and files to analyze</p>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* URL Intake */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add URL Source</h2>
          <form onSubmit={handleAddUrl} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL *
              </label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title (optional)
              </label>
              <input
                type="text"
                value={urlTitle}
                onChange={(e) => setUrlTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Competitor Homepage"
              />
            </div>

            <button
              type="submit"
              disabled={isAddingUrl || !urlInput}
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isAddingUrl ? 'Adding...' : 'Add URL'}
            </button>
          </form>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload File</h2>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File (PDF, DOCX, TXT, HTML)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.html"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  {selectedFile ? (
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-gray-900">
                        Drag and drop or click to select
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        PDF, DOCX, TXT, or HTML files
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Upload File'}
            </button>
          </form>
        </div>
      </div>

      {/* Sources List */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Sources ({sources.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading sources...</p>
          </div>
        ) : sources.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            No sources added yet. Add a URL or upload a file above.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sources.map((source) => (
              <div key={source.id} className="p-6 hover:bg-gray-50 flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {source.type}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900">{source.title}</h3>
                  {source.sourceUrl && (
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {source.sourceUrl}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(source.createdAt).toLocaleString()}
                  </p>
                  <div className="mt-3">
                    <SourceStatus
                      sourceId={source.id}
                      projectId={projectId}
                      initialStatus={source.status}
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteSource(source.id)}
                  className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
