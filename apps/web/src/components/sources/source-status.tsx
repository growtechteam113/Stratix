'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';

interface SourceStatusProps {
  sourceId: string;
  projectId: string;
  initialStatus: string;
}

export function SourceStatus({
  sourceId,
  projectId,
  initialStatus,
}: SourceStatusProps) {
  const [status, setStatus] = useState(initialStatus);
  const [progress, setProgress] = useState(0);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (initialStatus === 'PENDING' || initialStatus === 'PROCESSING') {
      setIsPolling(true);
    }
  }, [initialStatus]);

  useEffect(() => {
    if (!isPolling) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await apiClient.get(
          `/sources/${sourceId}/ingestion/progress`,
        );

        const { data } = response.data;

        if (data) {
          setStatus(data.status);
          setProgress(data.progress || 0);

          if (data.status === 'COMPLETED' || data.status === 'FAILED') {
            setIsPolling(false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch progress:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [sourceId, isPolling]);

  const getStatusColor = () => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'PROCESSING':
        return 'Processing';
      case 'COMPLETED':
        return 'Completed';
      case 'FAILED':
        return 'Failed';
      default:
        return status;
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
        {getStatusLabel()}
      </div>

      {status === 'PROCESSING' && (
        <div className="flex-1">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">{progress}% complete</p>
        </div>
      )}
    </div>
  );
}
