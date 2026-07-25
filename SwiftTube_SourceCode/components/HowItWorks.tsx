'use client';

import { Link, Zap, Download } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: <Link className="h-6 w-6" />,
    title: 'Paste the URL',
    description:
      'Copy any YouTube video link — standard, short (youtu.be), Shorts, or live streams — and paste it into the input.',
    color: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
    iconColor: 'text-blue-400',
    glowColor: 'bg-blue-500/20',
  },
  {
    step: '02',
    icon: <Zap className="h-6 w-6" />,
    title: 'Fetch Information',
    description:
      'Click Download and we instantly fetch the video metadata — title, thumbnail, channel, and all available quality formats.',
    color: 'from-green-500/20 to-green-600/5 border-green-500/30',
    iconColor: 'text-green-400',
    glowColor: 'bg-green-500/20',
  },
  {
    step: '03',
    icon: <Download className="h-6 w-6" />,
    title: 'Choose & Download',
    description:
      'Pick your preferred format — 4K video, 1080p MP4, MP3 audio — and the file streams directly to your device.',
    color: 'from-purple-500/20 to-purple-600/5 border-purple-500/30',
    iconColor: 'text-purple-400',
    glowColor: 'bg-purple-500/20',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          How it{' '}
          <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            works
          </span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Download any YouTube video in three simple steps. No technical knowledge required.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {/* Connection line */}
        <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {STEPS.map((step) => (
          <div
            key={step.step}
            className={`relative group rounded-2xl border bg-gradient-to-b p-6 transition-all duration-300 hover:shadow-xl ${step.color}`}
          >
            {/* Glow */}
            <div
              className={`absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-24 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity ${step.glowColor}`}
            />

            {/* Step number */}
            <div className="flex items-start justify-between mb-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl border border-border/50 bg-background/50 ${step.iconColor}`}
              >
                {step.icon}
              </div>
              <span className="text-4xl font-black text-border/40 select-none">{step.step}</span>
            </div>

            <h3 className="text-lg font-bold mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
