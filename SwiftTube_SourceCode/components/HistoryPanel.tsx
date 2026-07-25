'use client';

import { Clock, Trash2, ExternalLink, History, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DownloadHistoryItem } from '@/lib/types';
import { useState } from 'react';
import Image from 'next/image';

interface HistoryPanelProps {
  history: DownloadHistoryItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
}

export function HistoryPanel({ history, onRemove, onClear }: HistoryPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (history.length === 0) return null;

  const displayed = expanded ? history : history.slice(0, 3);

  return (
    <section id="history" className="animate-fade-in">
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4 text-green-500" />
              Recent Downloads
              <span className="rounded-full bg-green-500/20 border border-green-500/30 px-2 py-0.5 text-xs text-green-400 font-medium">
                {history.length}
              </span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-xs text-muted-foreground hover:text-red-400 gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear all
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {displayed.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-3 rounded-xl border border-border/30 bg-secondary/10 p-3 hover:border-border/50 hover:bg-secondary/20 transition-all"
            >
              {/* Thumbnail */}
              <div className="relative h-14 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                <p className="text-xs text-muted-foreground truncate">{item.channel}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="rounded bg-secondary border border-border/50 px-1.5 py-0.5 text-[10px] font-medium">
                    {item.quality}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {timeAgo(item.downloadedAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 bg-secondary hover:bg-secondary/80 transition-colors"
                  title="Open on YouTube"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={() => onRemove(item.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 bg-secondary hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
                  title="Remove from history"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-400" />
                </button>
              </div>
            </div>
          ))}

          {/* Show more */}
          {history.length > 3 && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="flex w-full items-center justify-center gap-1 pt-1 text-xs text-muted-foreground hover:text-green-400 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" /> Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" /> Show {history.length - 3} more
                </>
              )}
            </button>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
