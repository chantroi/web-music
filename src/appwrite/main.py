import json
import yt_dlp
from youtube_search import YoutubeSearch


def music(video_url):
    ydl_opts = {"format": "bestaudio/best"}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(video_url, download=False)
        return info_dict


def ytsearch(kw):
    results = YoutubeSearch(kw, max_results=5).to_json()
    return json.loads(results)


def main(ctx):
    action = ctx.req.query("action")
    if action == "search":
        kw = ctx.req.query("kw")
        result = ytsearch(ctx.req.query(kw))
        return ctx.res.json(result)
    elif action == "music":
        url = ctx.req.query("url")
        info = music(url)
        return ctx.res.json(
            {
                "url": info["url"],
                "name": info["title"],
                "artist": info.get("channel"),
                "cover": info.get("thumbnail"),
            }
        )
    else:
        return ctx.res.json({"status": "error", "message": "action not found"})
