// ============================================================
//  Universal URL Validation
// ============================================================

export function isValidYouTubeUrl(url: string): boolean {
  // We keep the function name for compatibility with existing components
  // but change the logic to accept ANY valid HTTP/HTTPS URL
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function detectPlatform(url: string): 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'facebook' | 'snapchat' | 'unknown' {
  if (!url) return 'unknown';
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('youtu')) return 'youtube';
  if (lowerUrl.includes('instagram.com')) return 'instagram';
  if (lowerUrl.includes('tiktok.com')) return 'tiktok';
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return 'twitter';
  if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.watch')) return 'facebook';
  if (lowerUrl.includes('snapchat.com')) return 'snapchat';
  return 'unknown';
}

export function normalizeUrl(url: string): string {
  // For YouTube shorts or youtu.be, we can keep original normalizer if needed, 
  // but for a universal downloader it's safer to just return the trimmed URL
  // so yt-dlp gets exactly what the user pasted.
  return url.trim();
}
