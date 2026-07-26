'use client';

import { Zap, Heart, Github, Shield, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/60 backdrop-blur-sm mt-16">
      <div className="container px-4 md:px-8 py-12">
        {/* Disclaimer */}
        <div className="mb-8 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <div className="flex gap-2">
            <Shield className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-yellow-500">Legal Disclaimer: </span>
              SwiftTube is intended for personal, educational, and fair-use purposes only. Downloading copyrighted content
              without permission may violate YouTube&apos;s{' '}
              <a
                href="https://www.youtube.com/t/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-yellow-400 transition-colors"
              >
                Terms of Service
              </a>{' '}
              and applicable copyright laws. Only download content you own or have permission to download.
              The developers are not responsible for any misuse of this tool.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/30">
                <Zap className="h-4 w-4 text-white" fill="white" />
              </div>
              <span className="text-base font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                SwiftTube
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              The fastest, cleanest YouTube downloader. Powered by yt-dlp — the most capable
              open-source video downloader.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Resources</h4>
            <ul className="space-y-2">
              {[
                { label: 'yt-dlp GitHub', href: 'https://github.com/yt-dlp/yt-dlp', external: true },
                { label: 'YouTube ToS', href: 'https://www.youtube.com/t/terms', external: true },
                { label: 'How it works', href: '#how-it-works', external: false },
                { label: 'Supported formats', href: '#formats', external: false },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-green-400 transition-colors"
                  >
                    {link.label}
                    {link.external && <ExternalLink className="h-3 w-3" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Built with</h4>
            <div className="flex flex-wrap gap-2">
              {['Next.js 14', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'yt-dlp', 'Radix UI'].map(
                (tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-border/50 bg-secondary/30 px-2 py-1 text-[10px] font-medium text-muted-foreground"
                  >
                    {tech}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/40 pt-6">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-400 fill-current" /> for the open-source community
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-3.5 w-3.5" />
            View on GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
