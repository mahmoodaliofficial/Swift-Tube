import json
import re
import urllib.request

def get_trending():
    req = urllib.request.Request("https://www.youtube.com/feed/trending", headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    })
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
    except Exception as e:
        print("Failed to fetch:", e)
        return
    
    match = re.search(r"var ytInitialData = ({.*?});</script>", html)
    if not match:
        print("Failed to find ytInitialData")
        return
    
    data = json.loads(match.group(1))
    
    # Very deep nested json parsing
    try:
        tabs = data['contents']['twoColumnBrowseResultsRenderer']['tabs']
        trending_tab = tabs[0]['tabRenderer']['content']['sectionListRenderer']['contents']
        videos = trending_tab[0]['itemSectionRenderer']['contents'][0]['shelfRenderer']['content']['expandedShelfContentsRenderer']['items']
        
        results = []
        for v in videos[:4]:
            if 'videoRenderer' in v:
                vr = v['videoRenderer']
                title = vr['title']['runs'][0]['text']
                videoId = vr['videoId']
                channel = vr['ownerText']['runs'][0]['text']
                views = vr['shortViewCountText']['simpleText'] if 'shortViewCountText' in vr else ""
                duration = vr['lengthText']['simpleText'] if 'lengthText' in vr else ""
                thumbnail = vr['thumbnail']['thumbnails'][-1]['url']
                results.append({
                    "id": videoId,
                    "title": title,
                    "channel": channel,
                    "views": views,
                    "duration": duration,
                    "thumbnail": thumbnail,
                    "tags": ["Trending"]
                })
        print(json.dumps(results, indent=2))
    except Exception as e:
        print("Error parsing JSON:", e)

if __name__ == "__main__":
    get_trending()
