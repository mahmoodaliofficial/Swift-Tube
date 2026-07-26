'use client';

import Image from 'next/image';
import { Eye, Clock, User, ExternalLink, Copy, CheckCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { VideoInfo } from '@/lib/types';
import { useState } from 'react';

import { motion } from 'framer-motion';

interface VideoInfoCardProps {
  info: VideoInfo;
}

function formatDate(uploadDate: string): string {
  if (!uploadDate || uploadDate.length < 8) return 'Unknown date';
  const y = uploadDate.slice(0, 4);
  const m = uploadDate.slice(4, 6);
  const d = uploadDate.slice(6, 8);
  return new Date(`${y}-${m}-${d}`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function VideoInfoCard({ info }: VideoInfoCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(info.webpage_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const platformName = info.platformName || 'Platform';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card className="overflow-hidden glass shadow-2xl border-none rounded-3xl">
        <CardContent className="p-0">
        <div className="flex flex-col md:flex-row gap-0">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0 md:w-72 lg:w-96">
            <div className="relative aspect-video md:aspect-auto md:h-full min-h-[220px] bg-black">
              <Image
                src={info.thumbnail || '/placeholder.png'}
                alt={info.title}
                fill
                className="object-cover opacity-90"
                unoptimized
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              {/* Duration badge */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-black/80 backdrop-blur-md px-2.5 py-1.5 border border-white/10 shadow-lg">
                <Clock className="h-3.5 w-3.5 text-neon-cyan" />
                <span className="text-xs font-bold tracking-wide text-white">{info.durationFormatted}</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-between p-6 md:p-8 flex-1 gap-6 bg-gradient-to-r from-black/40 to-transparent">
            {/* Title */}
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold leading-tight line-clamp-3 mb-4 text-white">
                {info.title}
              </h2>

              {/* Meta row */}
              <div className="flex flex-wrap gap-4 text-sm text-white/70">
                <span className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1 border border-white/10">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-neon-fuchsia">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-semibold text-white truncate max-w-[180px]">
                    {info.channel}
                  </span>
                </span>

                <span className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1 border border-white/10">
                  <Eye className="h-4 w-4 text-neon-cyan" />
                  <span className="font-medium">{info.viewCountFormatted} views</span>
                </span>

                <span className="flex items-center text-white/50 font-medium">
                  {formatDate(info.uploadDate)}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {[
                { label: 'Platform', value: platformName, color: 'text-neon-fuchsia' },
                { label: 'Formats', value: `${info.formats?.length || 0}`, color: 'text-neon-cyan' },
                { label: 'Views', value: info.viewCountFormatted, color: 'text-neon-violet' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 text-center hover:bg-white/10 transition-colors"
                >
                  <div className={`text-lg font-black ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs font-medium text-white/50 mt-1 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-2">
              <a
                href={info.webpage_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 hover:border-neon-cyan/50 hover:text-neon-cyan transition-all shadow-lg"
              >
                <ExternalLink className="h-4 w-4" />
                Open Original
              </a>

              <button
                onClick={handleCopy}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 hover:border-neon-fuchsia/50 hover:text-neon-fuchsia transition-all shadow-lg"
              >
                {copied ? (
                  <>
                    <CheckCheck className="h-4 w-4 text-neon-fuchsia" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}
