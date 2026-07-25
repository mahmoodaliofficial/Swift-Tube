'use client';

import { TrendingUp, Eye, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

// These are illustrative mock cards — replace with real trending data via YouTube API
const TRENDING = [
  {
    id: '1',
    title: 'Grand Theft Auto VI Trailer 1',
    channel: 'Rockstar Games',
    views: '185M',
    duration: '1:30',
    thumbnail: 'https://i.ytimg.com/vi/QdBZY2fkU-0/hqdefault.jpg',
    tags: ['Gaming', 'Trailer'],
  },
  {
    id: '2',
    title: '$456,000 Squid Game In Real Life!',
    channel: 'MrBeast',
    views: '541M',
    duration: '25:42',
    thumbnail: 'https://i.ytimg.com/vi/0e3GPea1Tyg/hqdefault.jpg',
    tags: ['Challenge', 'Trending'],
  },
  {
    id: '3',
    title: 'The Weeknd - Blinding Lights (Official Video)',
    channel: 'TheWeekndVEVO',
    views: '7.8B',
    duration: '4:22',
    thumbnail: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg',
    tags: ['Music', 'Pop'],
  },
  {
    id: '4',
    title: 'Gordon Ramsay\'s 10 Millionth Subscriber Burger Recipe',
    channel: 'Gordon Ramsay',
    views: '35M',
    duration: '10:15',
    thumbnail: 'https://i.ytimg.com/vi/eueyYOMCRuc/hqdefault.jpg',
    tags: ['Food', 'Cooking'],
  },
  {
    id: '5',
    title: 'iPhone 15 Pro Review: The Good, The Bad, & The Ugly!',
    channel: 'Marques Brownlee',
    views: '12M',
    duration: '18:40',
    thumbnail: 'https://i.ytimg.com/vi/R98p5oK8Q6w/hqdefault.jpg',
    tags: ['Tech', 'Review'],
  },
  {
    id: '6',
    title: 'Ed Sheeran - Shape of You (Official Music Video)',
    channel: 'Ed Sheeran',
    views: '6.2B',
    duration: '4:23',
    thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    tags: ['Music', 'Pop'],
  },
  {
    id: '7',
    title: 'Backyard Squirrel Maze 1.0- Ninja Warrior Course',
    channel: 'Mark Rober',
    views: '120M',
    duration: '21:39',
    thumbnail: 'https://i.ytimg.com/vi/hFZFjoX2cGg/hqdefault.jpg',
    tags: ['Science', 'Animals'],
  },
  {
    id: '8',
    title: 'BLACKPINK - ‘뚜두뚜두 (DDU-DU DDU-DU)’ M/V',
    channel: 'BLACKPINK',
    views: '2.1B',
    duration: '3:35',
    thumbnail: 'https://i.ytimg.com/vi/IHNzOHi8sJs/hqdefault.jpg',
    tags: ['Music', 'K-Pop'],
  },
];

import { useState, useEffect } from 'react';

export function TrendingSection() {
  const [currentTrending, setCurrentTrending] = useState(TRENDING.slice(0, 4));

  useEffect(() => {
    // Rotate the 4 videos displayed based on the current day (UTC)
    // This gives the illusion of a live daily feed updating every 24 hours
    const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const startIndex = (today * 4) % TRENDING.length;
    const rotated = [];
    
    for (let i = 0; i < 4; i++) {
      rotated.push(TRENDING[(startIndex + i) % TRENDING.length]);
    }
    setCurrentTrending(rotated);
  }, []);

  return (
    <section className="py-12">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-green-500" />
        <h2 className="text-xl font-bold">Trending to Download</h2>
        <span className="ml-2 rounded-full border border-border/50 bg-secondary/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Popular
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentTrending.map((video) => (
          <Card
            key={video.id}
            className="group overflow-hidden border-border/40 bg-card/50 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/5 transition-all duration-300 cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={video.thumbnail}
                alt={video.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Duration */}
              <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-semibold text-white flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {video.duration}
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-green-500 opacity-0 group-hover:opacity-90 transition-all duration-300 flex items-center justify-center shadow-lg">
                  <svg className="h-5 w-5 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="text-xs font-semibold line-clamp-2 leading-tight mb-2">{video.title}</h3>
              <p className="text-[11px] text-muted-foreground mb-2">{video.channel}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  {video.views}
                </div>
                <div className="flex gap-1">
                  {video.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-secondary/50 border border-border/40 px-1.5 py-0.5 text-[9px] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
