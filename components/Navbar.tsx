'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun, Moon, Zap, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-green-500 opacity-20 blur-md group-hover:opacity-40 transition-opacity" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/30">
              <Zap className="h-5 w-5 text-white" fill="white" />
            </div>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              SwiftTube
            </span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">
              Downloader
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
            How it works
          </a>
          <a href="#formats" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
            Formats
          </a>
          <a href="#history" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
            History
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex"
          >
            <Button variant="ghost" size="icon" aria-label="View on GitHub">
              <Github className="h-4 w-4" />
            </Button>
          </a>

          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-yellow-400" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
