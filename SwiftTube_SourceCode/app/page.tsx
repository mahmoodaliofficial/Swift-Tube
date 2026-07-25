'use client';

import { useCallback } from 'react';
import { HeroSection } from '@/components/HeroSection';
import { VideoInfoCard } from '@/components/VideoInfoCard';
import { FormatSelector } from '@/components/FormatSelector';
import { DownloadProgress } from '@/components/DownloadProgress';
import { HistoryPanel } from '@/components/HistoryPanel';
import { HowItWorks } from '@/components/HowItWorks';
import { TrendingSection } from '@/components/TrendingSection';
import { useVideoInfo } from '@/hooks/useVideoInfo';
import { useHistory } from '@/hooks/useHistory';
import type { VideoFormat } from '@/lib/types';
import { normalizeUrl } from '@/lib/validate';
import { BackgroundAudio } from '@/components/BackgroundAudio';

export default function Home() {
  const { status, videoInfo, error, fetchInfo, reset } = useVideoInfo();
  const { history, addToHistory, removeFromHistory, clearHistory } = useHistory();

  const handleFetch = useCallback(
    (url: string) => {
      reset();
      fetchInfo(url);
    },
    [fetchInfo, reset]
  );

  const handleDownload = useCallback(
    (format: VideoFormat | null, type: 'best-video' | 'best-audio' | 'format') => {
      if (!videoInfo) return;

      const url = videoInfo.webpage_url;
      const title = videoInfo.title;

      const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
      let downloadUrl = '';
      let qualityLabel = '';

      if (type === 'best-video') {
        downloadUrl = `${apiBase}/api/download?url=${encodeURIComponent(url)}&type=video&title=${encodeURIComponent(title)}`;
        qualityLabel = 'Best Video';
      } else if (type === 'best-audio') {
        downloadUrl = `${apiBase}/api/download?url=${encodeURIComponent(url)}&type=audio&title=${encodeURIComponent(title)}`;
        qualityLabel = 'Best Audio';
      } else if (format) {
        downloadUrl = `${apiBase}/api/download?url=${encodeURIComponent(url)}&format=${encodeURIComponent(format.formatId)}&title=${encodeURIComponent(title)}`;
        qualityLabel = format.label;
      }

      if (!downloadUrl) return;

      // Trigger browser download natively for mobile
      window.location.href = downloadUrl;

      // Save to history
      addToHistory({
        id: `${videoInfo.id}-${format?.formatId || type}-${Date.now()}`,
        videoId: videoInfo.id,
        title: videoInfo.title,
        thumbnail: videoInfo.thumbnail,
        channel: videoInfo.channel,
        format: format?.ext || (type === 'best-audio' ? 'm4a' : 'mp4'),
        quality: qualityLabel,
        url: videoInfo.webpage_url,
        duration: videoInfo.durationFormatted,
      });
    },
    [videoInfo, addToHistory]
  );

  return (
    <div className="relative">
      {/* Hero */}
      <HeroSection
        onFetch={handleFetch}
        isLoading={status === 'fetching-info'}
      />

      {/* Main content area */}
      <div className="container px-4 md:px-8 pb-8 space-y-6 max-w-4xl mx-auto">
        {/* Progress / Status */}
        {status !== 'idle' && (
          <DownloadProgress status={status} error={error} />
        )}

        {/* Video result */}
        {videoInfo && status === 'ready' && (
          <>
            <VideoInfoCard info={videoInfo} />
            <FormatSelector info={videoInfo} onDownload={handleDownload} />
          </>
        )}

        {/* History */}
        <HistoryPanel
          history={history}
          onRemove={removeFromHistory}
          onClear={clearHistory}
        />
      </div>

      {/* How it works */}
      <div className="container px-4 md:px-8 max-w-5xl mx-auto">
        <HowItWorks />
      </div>

      {/* Trending */}
      <div className="container px-4 md:px-8 max-w-6xl mx-auto">
        <TrendingSection />
      </div>

      <BackgroundAudio info={videoInfo} />
    </div>
  );
}
