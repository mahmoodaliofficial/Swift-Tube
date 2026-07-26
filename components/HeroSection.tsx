'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Clipboard, X, Zap, ArrowRight, Loader2, Youtube, Instagram, Twitter, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isValidYouTubeUrl, detectPlatform } from '@/lib/validate'; 
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
    </svg>
  );
}

const THEMES = {
  default: {
    '--theme-color-1': '#00f3ff', // Cyan
    '--theme-color-2': '#8a2be2', // Violet
    '--theme-color-3': '#ff00ff', // Fuchsia
  },
  youtube: {
    '--theme-color-1': '#ff0000', // Red
    '--theme-color-2': '#b30000', // Dark Red
    '--theme-color-3': '#ff4d4d', // Light Red
  },
  tiktok: {
    '--theme-color-1': '#00f2fe', // Cyan
    '--theme-color-2': '#111111', // Black/Dark
    '--theme-color-3': '#fe0979', // Pink
  },
  instagram: {
    '--theme-color-1': '#feda75', // Yellow
    '--theme-color-2': '#fa7e1e', // Orange
    '--theme-color-3': '#d62976', // Pink/Purple
  },
  twitter: {
    '--theme-color-1': '#1DA1F2', // Blue
    '--theme-color-2': '#14171A', // Dark
    '--theme-color-3': '#AAB8C2', // Light Blue
  },
  facebook: {
    '--theme-color-1': '#1877F2', // FB Blue
    '--theme-color-2': '#0c5ac9', // Dark Blue
    '--theme-color-3': '#42b72a', // Green (Messenger/Create)
  },
  snapchat: {
    '--theme-color-1': '#FFFC00', // Yellow
    '--theme-color-2': '#000000', // Black
    '--theme-color-3': '#ffffff', // White
  }
};

interface HeroSectionProps {
  onFetch: (url: string) => void;
  isLoading: boolean;
}

const PLACEHOLDER_URLS = [
  'Paste a YouTube, Instagram, or TikTok link...',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://www.instagram.com/reel/xyz/',
];

export function HeroSection({ onFetch, isLoading }: HeroSectionProps) {
  const [url, setUrl] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [pasted, setPasted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dynamic Platform Theming
  const updateTheme = useCallback((platform: string) => {
    const theme = THEMES[platform as keyof typeof THEMES] || THEMES.default;
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, []);

  const validateUrl = useCallback((val: string) => {
    if (!val.trim()) {
      setIsValid(null);
      updateTheme('default');
      return;
    }
    const valid = isValidYouTubeUrl(val.trim());
    setIsValid(valid);
    
    if (valid) {
      const platform = detectPlatform(val.trim());
      updateTheme(platform);
    } else {
      updateTheme('default');
    }
  }, [updateTheme]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    validateUrl(val);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      validateUrl(text);
      setPasted(true);
      setTimeout(() => setPasted(false), 2000);
      inputRef.current?.focus();
    } catch {
      inputRef.current?.focus();
    }
  };

  const handleClear = () => {
    setUrl('');
    setIsValid(null);
    updateTheme('default');
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;
    if (isValid === false) return;
    onFetch(url.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit(e as unknown as React.FormEvent);
  };

  // Reset theme on unmount just in case
  useEffect(() => {
    return () => updateTheme('default');
  }, [updateTheme]);

  return (
    <section className="relative flex flex-col items-center justify-center px-4 pt-20 pb-16 md:pt-32 md:pb-24 overflow-visible">
      {/* Badge */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="mb-6 relative z-10"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 px-4 py-1.5 text-xs font-semibold text-neon-cyan backdrop-blur-md transition-colors" style={{ color: 'var(--theme-color-1)', borderColor: 'var(--theme-color-1)' }}>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: 'var(--theme-color-1)' }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--theme-color-1)' }} />
          </span>
          Universal Engine 2.0
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        className="relative z-10 text-center text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl mb-4"
      >
        Universal Media{' '}
        <span className="gradient-text transition-all duration-500">
          Downloader
        </span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 text-center text-muted-foreground text-base md:text-lg max-w-xl mb-8"
      >
        Paste a link from YouTube, Instagram, TikTok, Twitter, or Facebook. Download in 4K, HD, or MP3 instantly.
      </motion.p>

      {/* Supported Platforms Icons */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
        className="relative z-10 flex gap-4 mb-10 text-white/30"
      >
        <Youtube className="w-6 h-6 hover:text-[#ff0000] transition-colors cursor-pointer" />
        <Instagram className="w-6 h-6 hover:text-[#d62976] transition-colors cursor-pointer" />
        <TikTokIcon className="w-6 h-6 hover:text-[#fe0979] transition-colors cursor-pointer" />
        <Twitter className="w-6 h-6 hover:text-[#1DA1F2] transition-colors cursor-pointer" />
        <Facebook className="w-6 h-6 hover:text-[#1877F2] transition-colors cursor-pointer" />
      </motion.div>

      {/* Input form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.4 }}
        onSubmit={handleSubmit}
        className="relative z-20 w-full max-w-3xl"
        id="url-form"
      >
        <div
          className={cn(
            'relative flex items-center rounded-2xl glass transition-all duration-500',
            isValid === true
              ? 'glow-cyan bg-black/60'
              : isValid === false
              ? 'border-red-500/60 shadow-red-500/10'
              : 'hover:bg-black/50 focus-within:glow-cyan focus-within:bg-black/60'
          )}
          style={{
            borderColor: isValid === true ? 'var(--theme-color-1)' : undefined
          }}
        >
          {/* Search icon */}
          <div className="flex-shrink-0 pl-5">
            <Search
              className="h-6 w-6 transition-colors duration-500"
              style={{ color: isValid === true ? 'var(--theme-color-1)' : 'rgba(255,255,255,0.3)' }}
            />
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            id="youtube-url-input"
            type="url"
            value={url}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDER_URLS[0]}
            className="flex-1 bg-transparent px-4 py-5 text-base md:text-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none font-medium"
            autoComplete="off"
            spellCheck={false}
            disabled={isLoading}
          />

          {/* Clear */}
          {url && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="flex-shrink-0 p-2 text-muted-foreground hover:text-white transition-colors mr-2"
              aria-label="Clear URL"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Paste button */}
          <button
            type="button"
            onClick={handlePaste}
            disabled={isLoading}
            className={cn(
              'flex-shrink-0 mr-3 flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200',
              pasted && 'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/5'
            )}
            style={{
              color: pasted ? 'var(--theme-color-1)' : undefined,
              borderColor: pasted ? 'var(--theme-color-1)' : undefined,
            }}
            aria-label="Paste from clipboard"
          >
            <Clipboard className="h-4 w-4" />
            {pasted ? 'Pasted!' : 'Paste'}
          </button>

          {/* Download button */}
          <Button
            type="submit"
            size="lg"
            disabled={isLoading || isValid === false}
            className={cn(
              "flex-shrink-0 mr-2 gap-2 rounded-xl h-[46px] font-semibold tracking-wide transition-all duration-500",
              isValid === true 
                ? "text-black hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                : "bg-white/10 text-white hover:bg-white/20"
            )}
            style={{
              backgroundColor: isValid === true ? 'var(--theme-color-1)' : undefined
            }}
            id="fetch-button"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Fetching...</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
                <ArrowRight className="h-4 w-4 hidden sm:block" />
              </>
            )}
          </Button>
        </div>

        {/* Validation hint */}
        {isValid === false && url && (
          <p className="mt-3 text-sm text-red-400 text-center animate-fade-in font-medium">
            ⚠ Please enter a valid URL
          </p>
        )}
      </motion.form>
    </section>
  );
}
