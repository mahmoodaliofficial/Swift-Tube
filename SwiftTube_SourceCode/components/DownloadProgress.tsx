'use client';

import { Loader2, Zap, Search, Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import type { DownloadStatus } from '@/lib/types';

interface DownloadProgressProps {
  status: DownloadStatus;
  error?: string | null;
}

const STATUS_CONFIG: Record<
  DownloadStatus,
  { label: string; icon: React.ReactNode; color: string }
> = {
  idle: {
    label: 'Ready to download',
    icon: <Zap className="h-4 w-4" />,
    color: 'text-muted-foreground',
  },
  'fetching-info': {
    label: 'Fetching video information...',
    icon: <Search className="h-4 w-4 animate-bounce-subtle" />,
    color: 'text-blue-400',
  },
  ready: {
    label: 'Video info loaded — choose a format below',
    icon: <Zap className="h-4 w-4 text-green-500" />,
    color: 'text-green-400',
  },
  downloading: {
    label: 'Downloading... your file will save automatically',
    icon: <Download className="h-4 w-4 animate-bounce-subtle" />,
    color: 'text-green-400',
  },
  error: {
    label: 'Something went wrong',
    icon: <Loader2 className="h-4 w-4" />,
    color: 'text-red-400',
  },
};

export function DownloadProgress({ status, error }: DownloadProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === 'fetching-info') {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 85) return p;
          return p + Math.random() * 12;
        });
      }, 400);
      return () => clearInterval(interval);
    }

    if (status === 'ready') {
      setProgress(100);
    }

    if (status === 'error' || status === 'idle') {
      setProgress(0);
    }
  }, [status]);

  if (status === 'idle') return null;

  const config = STATUS_CONFIG[status];

  return (
    <div className="animate-fade-in space-y-3 rounded-2xl border border-border/50 bg-card/60 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className={cn(config.color)}>{config.icon}</span>
        <span className={cn('text-sm font-medium', config.color)}>
          {status === 'error' && error ? error : config.label}
        </span>
        {status === 'fetching-info' && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400 ml-auto" />
        )}
      </div>

      {status === 'fetching-info' && (
        <Progress value={progress} className="h-1.5 bg-secondary">
          <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all" />
        </Progress>
      )}

      {status === 'error' && (
        <div className="text-xs text-red-400/80 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error || 'An unexpected error occurred. Please try again.'}
        </div>
      )}
    </div>
  );
}
