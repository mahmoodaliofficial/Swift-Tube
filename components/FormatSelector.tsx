'use client';

import { useState } from 'react';
import {
  Download,
  Video,
  Music,
  ChevronDown,
  ChevronUp,
  Loader2,
  HardDrive,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { VideoFormat, VideoInfo } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface FormatSelectorProps {
  info: VideoInfo;
  onDownload: (format: VideoFormat | null, type: 'best-video' | 'best-audio' | 'format') => void;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '~';
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${bytes} B`;
}

const QUALITY_HEIGHTS = [2160, 1440, 1080, 720, 480, 360, 240, 144];
const QUALITY_LABELS: Record<number, string> = {
  2160: '4K Ultra HD',
  1440: '2K QHD',
  1080: 'Full HD',
  720: 'HD',
  480: 'SD',
  360: '360p',
  240: '240p',
  144: '144p',
};

const QUALITY_COLORS: Record<number, string> = {
  2160: 'border-neon-fuchsia/40 bg-neon-fuchsia/5 hover:border-neon-fuchsia/60',
  1440: 'border-blue-500/40 bg-blue-500/5 hover:border-blue-500/60',
  1080: 'border-neon-cyan/40 bg-neon-cyan/5 hover:border-neon-cyan/60',
  720: 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60',
  480: 'border-yellow-500/40 bg-yellow-500/5 hover:border-yellow-500/60',
  360: 'border-orange-500/40 bg-orange-500/5 hover:border-orange-500/60',
  240: 'border-red-500/40 bg-red-500/5 hover:border-red-500/60',
  144: 'border-gray-500/40 bg-gray-500/5 hover:border-gray-500/60',
};

type TabType = 'video' | 'audio';

export function FormatSelector({ info, onDownload }: FormatSelectorProps) {
  const [activeTab, setActiveTab] = useState<TabType>('video');
  const [showAll, setShowAll] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const videoFormats = info.formats.filter(
    (f) => f.type === 'video+audio' || f.type === 'video'
  );
  const audioFormats = info.formats.filter((f) => f.type === 'audio');

  // Group video formats by height
  const groupedByHeight = new Map<number, VideoFormat[]>();
  const ungroupedFormats: VideoFormat[] = [];

  for (const fmt of videoFormats) {
    const resMatch = fmt.resolution.match(/(\d+)/);
    const height = resMatch ? parseInt(resMatch[1], 10) : 0;
    if (height > 0 && QUALITY_HEIGHTS.includes(height)) {
      if (!groupedByHeight.has(height)) groupedByHeight.set(height, []);
      groupedByHeight.get(height)!.push(fmt);
    } else {
      // Non-standard resolution (Instagram "Best", TikTok, etc.)
      ungroupedFormats.push(fmt);
    }
  }

  // Best format per standard height
  const bestPerHeight = QUALITY_HEIGHTS.map((h) => {
    const fmts = groupedByHeight.get(h) || [];
    return fmts.sort((a, b) => b.quality - a.quality)[0];
  }).filter(Boolean) as VideoFormat[];

  // Combine: ungrouped first (platform-native formats), then standard heights
  const allVideoFormats = [...ungroupedFormats, ...bestPerHeight];

  const displayedVideoFormats = showAll ? allVideoFormats : allVideoFormats.slice(0, 5);
  const displayedAudioFormats = showAll ? audioFormats : audioFormats.slice(0, 4);

  const handleDownload = async (format: VideoFormat | null, type: 'best-video' | 'best-audio' | 'format') => {
    const key = format?.formatId || type;
    setDownloading(key);
    onDownload(format, type);

    // Reset after a moment
    setTimeout(() => setDownloading(null), 3000);
    toast({
      title: '⬇ Download started',
      description: 'Your file will download shortly.',
      variant: 'default',
    });
  };

  return (
    <Card className="glass border-none rounded-3xl animate-fade-in shadow-2xl mt-6">
      <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-white">
          <Download className="h-5 w-5 text-neon-cyan" />
          Download Options
        </CardTitle>

        {/* Quick download row */}
        <div className="flex flex-wrap gap-3 pt-3">
          <Button
            size="default"
            onClick={() => handleDownload(null, 'best-video')}
            disabled={downloading === 'best-video'}
            id="btn-best-video"
            className="gap-2 bg-neon-cyan text-black hover:bg-white hover:shadow-[0_0_15px_rgba(0,243,255,0.4)] rounded-xl font-bold transition-all"
          >
            {downloading === 'best-video' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Star className="h-4 w-4" />
            )}
            Best Quality Video
          </Button>

          <Button
            variant="outline"
            size="default"
            onClick={() => handleDownload(null, 'best-audio')}
            disabled={downloading === 'best-audio'}
            id="btn-best-audio"
            className="gap-2 bg-transparent border-white/20 text-white hover:border-neon-fuchsia hover:text-neon-fuchsia rounded-xl font-bold transition-all hover:bg-neon-fuchsia/10"
          >
            {downloading === 'best-audio' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Music className="h-4 w-4" />
            )}
            Best Audio (MP3/M4A)
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Tab switcher */}
        <div className="flex rounded-xl border border-white/10 bg-black/40 p-1 w-fit">
          {(['video', 'audio'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-all duration-200',
                activeTab === tab
                  ? 'bg-white/10 shadow-lg text-white border border-white/10'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
            >
              {tab === 'video' ? <Video className="h-4 w-4" /> : <Music className="h-4 w-4" />}
              {tab === 'video' ? 'Video Formats' : 'Audio Only'}
            </button>
          ))}
        </div>

        {/* Video formats */}
        {activeTab === 'video' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedVideoFormats.length === 0 ? (
              <p className="text-white/50 text-sm col-span-3">No video formats found.</p>
            ) : (
              displayedVideoFormats.map((fmt) => {
                const resMatch = fmt.resolution.match(/(\d+)p/);
                const height = resMatch ? parseInt(resMatch[1], 10) : 0;
                const colorClass = QUALITY_COLORS[height] || 'border-white/10 bg-white/5 hover:border-white/30';
                const qualityLabel = QUALITY_LABELS[height] || '';
                const fileSize = formatFileSize(fmt.filesize || fmt.filesizeApprox);

                return (
                  <button
                    key={fmt.formatId}
                    onClick={() => handleDownload(fmt, 'format')}
                    disabled={downloading === fmt.formatId}
                    id={`btn-fmt-${fmt.formatId}`}
                    className={cn(
                      'group relative flex flex-col items-start gap-3 rounded-2xl border p-5 text-left transition-all duration-200 cursor-pointer hover:shadow-2xl active:scale-[0.98] bg-black/40 backdrop-blur-md',
                      colorClass
                    )}
                  >
                    {height >= 1080 && (
                      <span className="absolute top-3 right-3 rounded-md bg-neon-cyan/20 border border-neon-cyan/30 px-2 py-1 text-[10px] font-black text-neon-cyan uppercase tracking-widest shadow-[0_0_10px_rgba(0,243,255,0.2)]">
                        HD
                      </span>
                    )}

                    <div className="flex items-center gap-3">
                      {downloading === fmt.formatId ? (
                        <Loader2 className="h-5 w-5 animate-spin text-neon-cyan" />
                      ) : (
                        <Download className="h-5 w-5 text-white/50 group-hover:text-neon-cyan transition-colors" />
                      )}
                      <span className="font-extrabold text-lg text-white">{fmt.resolution}</span>
                      <span className="text-xs font-bold uppercase text-white/60 bg-white/10 rounded-md px-2 py-1">
                        {fmt.ext}
                      </span>
                    </div>

                    {qualityLabel && (
                      <span className="text-sm text-white/80 font-semibold">{qualityLabel}</span>
                    )}

                    <div className="flex items-center gap-2 text-xs text-white/50 font-medium">
                      <HardDrive className="h-3.5 w-3.5" />
                      {fileSize}
                      {fmt.fps && fmt.fps > 30 && (
                        <span className="rounded bg-white/10 px-1.5 py-0.5 ml-1">{fmt.fps}fps</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Audio formats */}
        {activeTab === 'audio' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayedAudioFormats.length === 0 ? (
              <p className="text-white/50 text-sm">No audio formats found.</p>
            ) : (
              displayedAudioFormats.map((fmt) => {
                const kbps = fmt.abr || fmt.tbr;
                const fileSize = formatFileSize(fmt.filesize || fmt.filesizeApprox);

                return (
                  <button
                    key={fmt.formatId}
                    onClick={() => handleDownload(fmt, 'format')}
                    disabled={downloading === fmt.formatId}
                    id={`btn-audio-${fmt.formatId}`}
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/40 p-5 hover:border-neon-fuchsia/40 hover:bg-neon-fuchsia/10 transition-all duration-200 cursor-pointer active:scale-[0.98] backdrop-blur-md"
                  >
                    <div className="flex items-center gap-4">
                      {downloading === fmt.formatId ? (
                        <Loader2 className="h-6 w-6 animate-spin text-neon-fuchsia" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-neon-fuchsia/50 group-hover:shadow-[0_0_15px_rgba(255,0,255,0.3)] transition-all">
                          <Music className="h-4 w-4 text-white/50 group-hover:text-neon-fuchsia transition-colors" />
                        </div>
                      )}
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm uppercase text-white">{fmt.ext}</span>
                          {kbps && (
                            <span className="text-xs bg-neon-fuchsia/20 text-neon-fuchsia px-2 py-0.5 rounded-md font-bold">
                              {Math.round(kbps)} kbps
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-white/50 font-medium">{fileSize}</div>
                      </div>
                    </div>
                    <Download className="h-5 w-5 text-white/30 group-hover:text-neon-fuchsia transition-colors flex-shrink-0" />
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Show more toggle */}
        {(activeTab === 'video' ? allVideoFormats : audioFormats).length > 4 && (
          <button
            onClick={() => setShowAll((s) => !s)}
            className="flex items-center justify-center gap-2 w-full mt-4 py-3 text-sm font-bold text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4" /> Show fewer formats
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" /> Show all formats
              </>
            )}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
