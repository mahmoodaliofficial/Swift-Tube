// ============================================================
//  yt-dlp wrapper — fetches metadata and streams downloads
// ============================================================

import { execFile } from 'child_process';
import { promisify } from 'util';
import { spawn } from 'child_process';
import path from 'path';
import type { VideoInfo, VideoFormat } from './types';

const execFileAsync = promisify(execFile);

// Resolve yt-dlp binary path
function getYtdlpPath(): string {
  if (process.env.YTDLP_PATH) return process.env.YTDLP_PATH;

  const platform = process.platform;
  if (platform === 'win32') return 'yt-dlp.exe';
  return 'yt-dlp'; // must be on PATH
}

const YTDLP = getYtdlpPath();

// Timeout for metadata fetch (30 seconds)
const INFO_TIMEOUT_MS = 30_000;

// ─── Helpers ───────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatViewCount(count: number): string {
  if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1)}B`;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Unknown';
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${bytes} B`;
}

// Map raw yt-dlp format entry to our VideoFormat type
function mapFormat(f: Record<string, unknown>): VideoFormat | null {
  const ext = (f.ext as string) || '';
  const vcodec = (f.vcodec as string) || 'none';
  const acodec = (f.acodec as string) || 'none';
  const resolution = (f.resolution as string) || '';
  const height = (f.height as number) || 0;
  const fps = (f.fps as number) || null;
  const filesize = (f.filesize as number) || null;
  const filesizeApprox = (f.filesize_approx as number) || null;
  const abr = (f.abr as number) || null;
  const tbr = (f.tbr as number) || null;
  const formatId = (f.format_id as string) || '';
  const formatNote = (f.format_note as string) || '';

  const hasVideo = vcodec !== 'none' && vcodec !== '';
  const hasAudio = acodec !== 'none' && acodec !== '';

  // Skip image formats and manifests
  if (['mhtml', 'sb0', 'sb1', 'sb2', 'sb3'].includes(ext)) return null;
  if (!hasVideo && !hasAudio) return null;

  let type: 'video' | 'audio' | 'video+audio';
  let label: string;
  let quality = 0;

  if (hasVideo && hasAudio) {
    type = 'video+audio';
    label = height ? `${height}p ${ext.toUpperCase()}` : `${resolution} ${ext.toUpperCase()}`;
    if (fps && fps > 30) label += ` ${fps}fps`;
    quality = height * 10 + (fps || 30) / 10;
  } else if (hasVideo) {
    type = 'video';
    label = height ? `${height}p ${ext.toUpperCase()} (video only)` : `${resolution} ${ext.toUpperCase()}`;
    if (fps && fps > 30) label += ` ${fps}fps`;
    quality = height * 10 + (fps || 30) / 10;
  } else {
    type = 'audio';
    const kbps = abr || tbr;
    label = kbps ? `${Math.round(kbps)}kbps ${ext.toUpperCase()}` : `${ext.toUpperCase()} audio`;
    if (formatNote) label = `${formatNote} ${ext.toUpperCase()}`;
    quality = kbps || 0;
  }

  return {
    formatId,
    ext,
    resolution: height ? `${height}p` : (resolution || 'audio'),
    fps,
    filesize,
    filesizeApprox,
    vcodec,
    acodec,
    abr,
    tbr,
    label,
    type,
    quality,
  };
}

// ─── Public API ───────────────────────────────────────────

/**
 * Fetch full video metadata using yt-dlp --dump-json
 */
export async function getVideoInfo(url: string): Promise<VideoInfo> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), INFO_TIMEOUT_MS);

  try {
    const { stdout } = await execFileAsync(
      YTDLP,
      [
        '--dump-json',
        '--no-playlist',
        '--no-warnings',
        '--socket-timeout', '15',
        url,
      ],
      { maxBuffer: 50 * 1024 * 1024 } // 50 MB buffer
    );

    clearTimeout(timer);

    const raw: any = JSON.parse(stdout);

    // Parse formats — filter nulls and sort by quality desc
    const formats: VideoFormat[] = (raw.formats || [])
      .map((f: Record<string, unknown>) => mapFormat(f))
      .filter(Boolean)
      .sort((a: VideoFormat, b: VideoFormat) => b.quality - a.quality);

    const info: VideoInfo = {
      id: raw.id,
      title: raw.title,
      description: raw.description || '',
      duration: raw.duration || 0,
      durationFormatted: formatDuration(raw.duration || 0),
      thumbnail:
        raw.thumbnail ||
        (Array.isArray(raw.thumbnails) && raw.thumbnails.length > 0
          ? raw.thumbnails[raw.thumbnails.length - 1].url
          : ''),
      channel: raw.uploader || raw.channel || 'Unknown',
      channelId: raw.channel_id || raw.uploader_id || '',
      viewCount: raw.view_count || 0,
      viewCountFormatted: formatViewCount(raw.view_count || 0),
      likeCount: raw.like_count || null,
      uploadDate: raw.upload_date || '',
      formats,
      originalUrl: url,
      webpage_url: raw.webpage_url || url,
    };

    return info;
  } catch (err: unknown) {
    clearTimeout(timer);
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('abort')) throw new Error('Request timed out. Try again.');
    if (msg.includes('not available')) throw new Error('This video is not available.');
    if (msg.includes('Private video')) throw new Error('This video is private.');
    if (msg.includes('age')) throw new Error('Age-restricted video cannot be downloaded.');
    throw new Error(`Failed to fetch video info: ${msg}`);
  }
}

/**
 * Stream a video/audio download using yt-dlp.
 * Returns the child process so the caller can pipe stdout.
 */
export function spawnYtdlpDownload(
  url: string,
  formatId: string
): ReturnType<typeof spawn> {
  const args: string[] = [
    '--no-playlist',
    '--no-warnings',
    '-f', formatId,
    '-o', '-',        // output to stdout
    '--socket-timeout', '30',
    url,
  ];

  return spawn(YTDLP, args, { stdio: ['ignore', 'pipe', 'pipe'] });
}

/**
 * Build a "best" format selector for given type and max height.
 */
export function buildFormatSelector(type: 'video' | 'audio', maxHeight?: number): string {
  if (type === 'audio') {
    return 'bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio';
  }
  if (maxHeight) {
    return `bestvideo[height<=${maxHeight}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${maxHeight}]+bestaudio/best[height<=${maxHeight}]/best`;
  }
  return 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best';
}
