'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  user: {
    email: string;
    name?: string;
  };
  sources: Array<{
    id: string;
    type: string;
    title: string;
    status: string;
    createdAt: string;
  }>;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await apiClient.get(`/projects/${projectId}`);
        setProject(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Project not found'}</p>
        <Link href="/app/projects" className="text-blue-600 hover:underline">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <Link href="/app/projects" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
            ← Back to Projects
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-gray-600 mt-2">{project.description}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Status</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {project.status}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Sources</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {project.sources.length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Created</div>
          <div className="text-lg font-semibold text-gray-900 mt-1">
            {new Date(project.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Sources</h2>
            <Link
              href={`/app/projects/${projectId}/sources`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Manage Sources
            </Link>
          </div>
        </div>

        {project.sources.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            <p>No sources added yet</p>
            <Link
              href={`/app/projects/${projectId}/sources`}
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              Add your first source
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {project.sources.map((source) => (
              <div key={source.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{source.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Type: {source.type} • Status: {source.status}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(source.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
