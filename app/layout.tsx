import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

export const metadata: Metadata = {
  title: 'Universal Media Downloader',
  description:
    'Download videos from YouTube, Instagram, TikTok, Facebook, Twitter and Snapchat. Free, fast, and no registration required.',
  keywords: ['youtube downloader', 'tiktok downloader', 'instagram downloader', 'video downloader', 'mp4', 'mp3', '4K', '1080p'],
  openGraph: {
    title: 'Universal Media Downloader',
    description: 'Download videos from any platform in any quality. Free and instant.',
    type: 'website',
    siteName: 'Media Downloader',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Universal Media Downloader',
    description: 'Download videos from any platform in any quality. Free and instant.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { GeometricBackground } from '@/components/GeometricBackground';
import { FeedbackModal } from '@/components/FeedbackModal';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <GeometricBackground />
          <div className="relative min-h-screen flex flex-col z-10">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <FeedbackModal />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
