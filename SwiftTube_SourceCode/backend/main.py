from fastapi import FastAPI, Request, Response, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp
import os
import uuid
import math
import subprocess

app = FastAPI(title="UthaLo Backend")

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InfoRequest(BaseModel):
    url: str

def format_duration(seconds: int) -> str:
    if not seconds: return "0:00"
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"

def format_view_count(n: int) -> str:
    if not n: return "0"
    if n >= 1e9: return f"{n / 1e9:.1f}B"
    if n >= 1e6: return f"{n / 1e6:.1f}M"
    if n >= 1e3: return f"{n / 1e3:.1f}K"
    return str(n)

def detect_platform(url: str) -> str:
    url = url.lower()
    if 'youtu' in url: return 'youtube'
    if 'instagram.com' in url: return 'instagram'
    if 'facebook.com' in url or 'fb.watch' in url: return 'facebook'
    if 'tiktok.com' in url: return 'tiktok'
    if 'twitter.com' in url or 'x.com' in url: return 'twitter'
    if 'vimeo.com' in url: return 'vimeo'
    return 'unknown'

def map_format(f: dict) -> dict:
    ext = f.get('ext', '')
    vcodec = f.get('vcodec', 'none')
    acodec = f.get('acodec', 'none')
    resolution = f.get('resolution', '')
    height = f.get('height', 0)
    fps = f.get('fps')
    abr = f.get('abr')
    tbr = f.get('tbr')
    
    has_video = vcodec != 'none' and vcodec != ''
    has_audio = acodec != 'none' and acodec != ''

    if ext in ['mhtml', 'sb0', 'sb1', 'sb2', 'sb3']: return None
    if not has_video and not has_audio: return None

    quality = 0
    if has_video and has_audio:
        type_ = 'video+audio'
        label = f"{height}p {ext.upper()}" if height else f"{resolution} {ext.upper()}"
        if fps and fps > 30: label += f" {fps}fps"
        quality = height * 10 + (fps or 30) / 10
    elif has_video:
        type_ = 'video'
        label = f"{height}p {ext.upper()} (video only)" if height else f"{resolution} {ext.upper()}"
        if fps and fps > 30: label += f" {fps}fps"
        quality = height * 10 + (fps or 30) / 10
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

@app.post("/api/info")
async def get_info(req: InfoRequest):
    url = req.url.strip()
    platform = detect_platform(url)
    
    ydl_opts = {
        'skip_download': True,
        'quiet': True,
        'no_warnings': True,
        'extractor_args': {'youtube': ['player_client=android,web']},
    }
    
    if platform in ['instagram', 'facebook']:
        ydl_opts['nocheckcertificate'] = True

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            raw = ydl.extract_info(url, download=False)
            
            formats = [map_format(f) for f in raw.get('formats', [])]
            formats = [f for f in formats if f is not None]
            formats.sort(key=lambda x: x['quality'], reverse=True)
            
            platform_name = {
                'youtube': 'YouTube',
                'instagram': 'Instagram',
                'facebook': 'Facebook',
                'tiktok': 'TikTok',
                'twitter': 'Twitter/X',
                'vimeo': 'Vimeo',
                'unknown': 'Unknown'
            }[platform]
            
            subtitles = []
            for sub_type in ['subtitles', 'automatic_captions']:
                subs_obj = raw.get(sub_type, {})
                for lang, subs in subs_obj.items():
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

            info = {
                "id": raw.get('id', ''),
                "title": raw.get('title', 'Untitled'),
                "description": raw.get('description', ''),
                "duration": raw.get('duration', 0),
                "durationFormatted": format_duration(raw.get('duration', 0)),
                "thumbnail": thumb,
                "channel": raw.get('uploader') or raw.get('channel') or raw.get('creator') or 'Unknown',
                "channelId": raw.get('channel_id') or raw.get('uploader_id') or '',
                "viewCount": raw.get('view_count', 0),
                "viewCountFormatted": format_view_count(raw.get('view_count', 0)),
                "likeCount": raw.get('like_count'),
                "uploadDate": raw.get('upload_date', ''),
                "formats": formats,
                "subtitles": subtitles,
                "originalUrl": url,
                "webpage_url": raw.get('webpage_url', url),
                "platform": platform,
                "platformName": platform_name
            }
            return JSONResponse({"success": True, "data": info})
    except Exception as e:
        msg = str(e).lower()
        if 'private' in msg: err = 'This content is private or unavailable.'
        elif 'age' in msg: err = 'Age-restricted content cannot be downloaded.'
        elif 'login' in msg: err = 'This content requires login. Only public content is supported.'
        else: err = f'Could not fetch video info. {str(e)[:200]}'
        return JSONResponse({"success": False, "error": err}, status_code=400)


@app.get("/api/download")
async def download_file(background_tasks: BackgroundTasks, url: str, type: str = None, format: str = None, title: str = 'video', height: str = None, start: str = None, end: str = None):
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
        'extractor_args': {'youtube': ['player_client=android,web']},
    }
    
    if start and end:
        ydl_opts['download_ranges'] = yt_dlp.utils.download_range_func(None, [(yt_dlp.utils.parse_duration(start), yt_dlp.utils.parse_duration(end))])
        
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
        'extractor_args': {'youtube': ['player_client=android,web']},
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
            
        subprocess.run(['ffmpeg', '-i', tmp_vid, '-vf', 'fps=10,scale=320:-1:flags=lanczos', tmp_gif], check=True)
        os.remove(tmp_vid)
        
        background_tasks.add_task(remove_file, tmp_gif)
        return FileResponse(path=tmp_gif, filename=f"{title[:50]}.gif", media_type='image/gif')
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
