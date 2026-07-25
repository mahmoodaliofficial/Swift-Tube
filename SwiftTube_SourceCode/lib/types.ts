// ============================================================
//  Shared TypeScript types for SwiftTube
// ============================================================

export interface VideoFormat {
  formatId: string;
  ext: string;
  resolution: string;
  fps: number | null;
  filesize: number | null;
  filesizeApprox: number | null;
  vcodec: string;
  acodec: string;
  abr: number | null;
  tbr: number | null;
  label: string;         // Human-readable label e.g. "1080p MP4"
  type: 'video' | 'audio' | 'video+audio';
  quality: number;       // Quality score (higher = better)
  directUrl?: string;
}

export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  duration: number;       // seconds
  durationFormatted: string;
  thumbnail: string;
  channel: string;
  channelId: string;
  viewCount: number;
  viewCountFormatted: string;
  likeCount: number | null;
  uploadDate: string;
  formats: VideoFormat[];
  originalUrl: string;
  webpage_url: string;
}

export interface DownloadHistoryItem {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  channel: string;
  format: string;
  quality: string;
  downloadedAt: string;
  url: string;
  duration: string;
}

export interface ApiInfoResponse {
  success: boolean;
  data?: VideoInfo;
  error?: string;
}

export interface ApiDownloadResponse {
  success: boolean;
  error?: string;
}

export type DownloadStatus = 'idle' | 'fetching-info' | 'ready' | 'downloading' | 'error';

export type ThemeMode = 'light' | 'dark' | 'system';
