from fastapi import FastAPI, Request, Response, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp
import os
import re
import uuid
import math
import subprocess
import urllib.request
import urllib.parse
import json

app = FastAPI(title="SwiftSave Backend")

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Piped API instances (for YouTube — bypasses cloud IP blocking) ───
PIPED_INSTANCES = [
    "https://pipedapi.kavin.rocks",
    "https://pipedapi.adminforge.de",
    "https://pipedapi.in.projectsegfault.com",
    "https://api.piped.projectsegfault.com",
    "https://pipedapi.r4fo.com",
    "https://pipedapi.leptons.xyz",
]

class InfoRequest(BaseModel):
    url: str


# ─── Helpers ─────────────────────────────────────────────

def format_duration(seconds) -> str:
    if not seconds:
        return "0:00"
    seconds = int(seconds)
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def format_view_count(n) -> str:
    if not n:
        return "0"
    n = int(n)
    if n >= 1e9:
        return f"{n / 1e9:.1f}B"
    if n >= 1e6:
        return f"{n / 1e6:.1f}M"
    if n >= 1e3:
        return f"{n / 1e3:.1f}K"
    return str(n)


def detect_platform(url: str) -> str:
    url = url.lower()
    if 'youtu' in url:
        return 'youtube'
    if 'instagram.com' in url:
        return 'instagram'
    if 'facebook.com' in url or 'fb.watch' in url:
        return 'facebook'
    if 'tiktok.com' in url:
        return 'tiktok'
    if 'twitter.com' in url or 'x.com' in url:
        return 'twitter'
    if 'vimeo.com' in url:
        return 'vimeo'
    return 'unknown'


def extract_youtube_id(url: str) -> str:
    """Extract YouTube video ID from various URL formats."""
    patterns = [
        r'(?:v=|/v/|youtu\.be/|/embed/|/shorts/)([a-zA-Z0-9_-]{11})',
        r'^([a-zA-Z0-9_-]{11})$',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return ''


def map_format(f: dict) -> dict:
    """Map yt-dlp format dict to our format structure."""
    ext = f.get('ext', '')
    vcodec = f.get('vcodec', 'none') or 'none'
    acodec = f.get('acodec', 'none') or 'none'
    resolution = f.get('resolution', '')
    height = f.get('height', 0) or 0
    fps = f.get('fps')
    abr = f.get('abr')
    tbr = f.get('tbr')

    has_video = vcodec != 'none' and vcodec != ''
    has_audio = acodec != 'none' and acodec != ''

    if ext in ['mhtml', 'sb0', 'sb1', 'sb2', 'sb3']:
        return None
    if not has_video and not has_audio:
        return None

    quality = 0
    if has_video and has_audio:
        type_ = 'video+audio'
        label = f"{height}p {ext.upper()}" if height else f"{resolution} {ext.upper()}"
        if fps and fps > 30:
            label += f" {fps}fps"
        quality = (height or 0) * 10 + ((fps or 30) / 10)
    elif has_video:
        type_ = 'video'
        label = f"{height}p {ext.upper()} (video only)" if height else f"{resolution} {ext.upper()}"
        if fps and fps > 30:
            label += f" {fps}fps"
        quality = (height or 0) * 10 + ((fps or 30) / 10)
    else:
        type_ = 'audio'
        kbps = abr or tbr
        label = f"{math.floor(kbps)}kbps {ext.upper()}" if kbps else f"{ext.upper()} audio"
        quality = kbps or 0

    return {
        "formatId": f.get('format_id', ''),
        "ext": ext,
        "resolution": f"{height}p" if height else (resolution or 'audio'),
        "fps": fps,
        "filesize": f.get('filesize'),
        "filesizeApprox": f.get('filesize_approx'),
        "vcodec": vcodec,
        "acodec": acodec,
        "abr": abr,
        "tbr": tbr,
        "label": label,
        "type": type_,
        "quality": quality,
        "directUrl": f.get('url'),
    }


def remove_file(path: str):
    try:
        if os.path.exists(path):
            os.remove(path)
    except:
        pass


# ─── yt-dlp for YouTube ───────────────────────────────

async def get_youtube_info(url: str, video_id: str) -> dict:
    """Get YouTube video info via yt-dlp using android client to bypass blocks."""
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True,
        'skip_download': True,
        'socket_timeout': 15,
        'retries': 3,
        'geo_bypass': True,
        'extractor_args': {'youtube': {'player_client': ['ios', 'android', 'tv', 'web']}}
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        raw = ydl.extract_info(url, download=False)
        
        formats = [map_format(f) for f in raw.get('formats', [])]
        formats = [f for f in formats if f is not None]
        formats.sort(key=lambda x: x['quality'], reverse=True)
        
        thumb = raw.get('thumbnail')
        if not thumb and video_id:
            thumb = f"https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg"
            
        return {
            "id": raw.get('id', video_id),
            "title": raw.get('title', 'Untitled'),
            "description": raw.get('description', ''),
            "duration": raw.get('duration', 0) or 0,
            "durationFormatted": format_duration(raw.get('duration', 0)),
            "thumbnail": thumb,
            "channel": raw.get('uploader') or raw.get('channel') or raw.get('creator') or 'Unknown',
            "channelId": raw.get('channel_id') or raw.get('uploader_id') or '',
            "viewCount": raw.get('view_count', 0) or 0,
            "viewCountFormatted": format_view_count(raw.get('view_count', 0)),
            "likeCount": raw.get('like_count'),
            "uploadDate": raw.get('upload_date', ''),
            "formats": formats,
            "subtitles": [],
            "originalUrl": url,
            "webpage_url": raw.get('webpage_url', url),
            "platform": "youtube",
            "platformName": "YouTube",
        }


# ─── yt-dlp for non-YouTube platforms ────────────────────

async def get_generic_info(url: str, platform: str) -> dict:
    """Get video info for Instagram, TikTok, etc. via yt-dlp."""
    ydl_opts = {
        'skip_download': True,
        'quiet': True,
        'no_warnings': True,
        'nocheckcertificate': True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        raw = ydl.extract_info(url, download=False)

        formats = [map_format(f) for f in raw.get('formats', [])]
        formats = [f for f in formats if f is not None]
        formats.sort(key=lambda x: x['quality'], reverse=True)

        # ── FIX: If no individual formats found, create a "Best Quality" entry ──
        # Instagram, TikTok, etc. often return a single merged stream or
        # the format info is in the top-level dict, not in 'formats'.
        if len(formats) == 0:
            direct_url = raw.get('url', '')
            ext = raw.get('ext', 'mp4') or 'mp4'
            height = raw.get('height', 0) or 0
            width = raw.get('width', 0) or 0
            filesize = raw.get('filesize') or raw.get('filesize_approx')

            if direct_url:
                formats.append({
                    "formatId": "best",
                    "ext": ext,
                    "resolution": f"{height}p" if height else "Best",
                    "fps": raw.get('fps'),
                    "filesize": filesize,
                    "filesizeApprox": filesize,
                    "vcodec": raw.get('vcodec', 'h264') or 'h264',
                    "acodec": raw.get('acodec', 'aac') or 'aac',
                    "abr": raw.get('abr'),
                    "tbr": raw.get('tbr'),
                    "label": f"{height}p {ext.upper()}" if height else f"Best Quality {ext.upper()}",
                    "type": "video+audio",
                    "quality": height * 10 if height else 1000,
                    "directUrl": direct_url,
                })

        # ── Also check for video-only formats with no height that might have been filtered ──
        # Some platforms return formats with vcodec set but height=0
        if len(formats) == 0:
            for f in raw.get('formats', []):
                direct_url = f.get('url', '')
                if direct_url:
                    ext = f.get('ext', 'mp4')
                    formats.append({
                        "formatId": f.get('format_id', 'fallback'),
                        "ext": ext,
                        "resolution": "Best",
                        "fps": f.get('fps'),
                        "filesize": f.get('filesize'),
                        "filesizeApprox": f.get('filesize_approx'),
                        "vcodec": f.get('vcodec', 'unknown'),
                        "acodec": f.get('acodec', 'unknown'),
                        "abr": f.get('abr'),
                        "tbr": f.get('tbr'),
                        "label": f"Best Quality {ext.upper()}",
                        "type": "video+audio",
                        "quality": 500,
                        "directUrl": direct_url,
                    })
                    break

        platform_name = {
            'youtube': 'YouTube',
            'instagram': 'Instagram',
            'facebook': 'Facebook',
            'tiktok': 'TikTok',
            'twitter': 'Twitter/X',
            'vimeo': 'Vimeo',
            'unknown': 'Platform'
        }.get(platform, 'Platform')

        subtitles = []
        for sub_type in ['subtitles', 'automatic_captions']:
            subs_obj = raw.get(sub_type, {})
            if not isinstance(subs_obj, dict):
                continue
            for lang, subs in subs_obj.items():
                if not isinstance(subs, list):
                    continue
                for sub in subs:
                    if sub.get('ext') in ['vtt', 'srt']:
                        subtitles.append({
                            'lang': lang,
                            'name': sub.get('name') or (f"{lang} (Auto)" if sub_type == 'automatic_captions' else lang),
                            'url': sub.get('url'),
                            'ext': sub.get('ext'),
                            'isAuto': sub_type == 'automatic_captions'
                        })

        thumbnails = raw.get('thumbnails', [])
        thumb = raw.get('thumbnail') or (thumbnails[-1]['url'] if thumbnails else '')

        return {
            "id": raw.get('id', ''),
            "title": raw.get('title', 'Untitled'),
            "description": raw.get('description', ''),
            "duration": raw.get('duration', 0) or 0,
            "durationFormatted": format_duration(raw.get('duration', 0)),
            "thumbnail": thumb,
            "channel": raw.get('uploader') or raw.get('channel') or raw.get('creator') or 'Unknown',
            "channelId": raw.get('channel_id') or raw.get('uploader_id') or '',
            "viewCount": raw.get('view_count', 0) or 0,
            "viewCountFormatted": format_view_count(raw.get('view_count', 0)),
            "likeCount": raw.get('like_count'),
            "uploadDate": raw.get('upload_date', ''),
            "formats": formats,
            "subtitles": subtitles,
            "originalUrl": url,
            "webpage_url": raw.get('webpage_url', url),
            "platform": platform,
            "platformName": platform_name,
        }


# ─── API Routes ─────────────────────────────────────────

@app.get("/")
async def root():
    return {"status": "ok", "message": "SwiftSave API is running"}


@app.post("/api/info")
async def get_info(req: InfoRequest):
    url = req.url.strip()
    platform = detect_platform(url)

    try:
        if platform == 'youtube':
            video_id = extract_youtube_id(url)
            if not video_id:
                return JSONResponse(
                    {"success": False, "error": "Invalid YouTube URL. Please check the link."},
                    status_code=400
                )
            info = await get_youtube_info(url, video_id)
        else:
            info = await get_generic_info(url, platform)

        return JSONResponse({"success": True, "data": info})

    except Exception as e:
        msg = str(e).lower()
        if 'private' in msg:
            err = 'This content is private or unavailable.'
        elif 'age' in msg:
            err = 'Age-restricted content cannot be downloaded.'
        elif 'login' in msg or 'sign in' in msg:
            err = 'This content requires login. Only public content is supported.'
        elif 'not found' in msg or '404' in msg:
            err = 'Video not found. Please check the URL.'
        else:
            err = f'Could not fetch video info. ERROR: {str(e)[:300]}'
        return JSONResponse({"success": False, "error": err}, status_code=400)


@app.get("/api/download")
async def download_file(
    background_tasks: BackgroundTasks,
    url: str,
    type: str = None,
    format: str = None,
    title: str = 'video',
    height: str = None,
    start: str = None,
    end: str = None,
    direct_url: str = None,
):
    platform = detect_platform(url)

    if format:
        resolved_format = format
    elif type == 'audio':
        resolved_format = 'bestaudio[ext=m4a]/bestaudio/best'
    else:
        max_h = f"[height<={height}]" if height else ""
        resolved_format = f"best{max_h}[ext=mp4]/b{max_h}/bestvideo{max_h}[ext=mp4]+bestaudio[ext=m4a]/best"

    ext = 'm4a' if type == 'audio' else 'mp4'
    safe_title = "".join([c if c.isalnum() or c in " -()" else "_" for c in title])[:100]
    filename = f"{safe_title}.{ext}"

    tmp_path = os.path.join(os.environ.get('TEMP', '/tmp'), f"{uuid.uuid4()}.{ext}")

    ydl_opts = {
        'format': resolved_format,
        'outtmpl': tmp_path,
        'quiet': True,
        'no_warnings': True,
        'nocheckcertificate': True,
        'socket_timeout': 30,
        'retries': 5,
        'geo_bypass': True,
        'extractor_args': {'youtube': {'player_client': ['ios', 'android', 'tv', 'web']}}
    }

    if start and end:
        try:
            ydl_opts['download_ranges'] = yt_dlp.utils.download_range_func(
                None, [(yt_dlp.utils.parse_duration(start), yt_dlp.utils.parse_duration(end))]
            )
        except:
            pass

    if type == 'audio':
        ydl_opts['postprocessors'] = [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'm4a',
        }]

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        background_tasks.add_task(remove_file, tmp_path)
        return FileResponse(
            path=tmp_path,
            filename=filename,
            media_type='audio/mp4' if type == 'audio' else 'video/mp4'
        )
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@app.get("/api/gif")
async def download_gif(background_tasks: BackgroundTasks, url: str, title: str = 'animation'):
    tmp_vid = os.path.join(os.environ.get('TEMP', '/tmp'), f"{uuid.uuid4()}.mp4")
    tmp_gif = os.path.join(os.environ.get('TEMP', '/tmp'), f"{uuid.uuid4()}.gif")

    ydl_opts = {
        'format': 'best[height<=480]',
        'outtmpl': tmp_vid,
        'quiet': True,
        'nocheckcertificate': True,
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        subprocess.run(
            ['ffmpeg', '-i', tmp_vid, '-vf', 'fps=10,scale=320:-1:flags=lanczos', tmp_gif],
            check=True
        )
        os.remove(tmp_vid)

        background_tasks.add_task(remove_file, tmp_gif)
        return FileResponse(path=tmp_gif, filename=f"{title[:50]}.gif", media_type='image/gif')
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
