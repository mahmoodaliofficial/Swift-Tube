'use client';

import { useState, useCallback } from 'react';
import type { VideoInfo, DownloadStatus, ApiInfoResponse } from '@/lib/types';

export function useVideoInfo() {
  const [status, setStatus] = useState<DownloadStatus>('idle');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchInfo = useCallback(async (url: string) => {
    setStatus('fetching-info');
    setError(null);
    setVideoInfo(null);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiBase}/api/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data: ApiInfoResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || `Server error: ${res.status}`);
      }

      setVideoInfo(data.data!);
      setStatus('ready');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setVideoInfo(null);
    setError(null);
  }, []);

  return { status, videoInfo, error, fetchInfo, reset };
}
