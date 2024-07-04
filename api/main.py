import json
import yt_dlp
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_search import YoutubeSearch
from deta import Deta


deta = Deta("c0kEEGmHJte_YjH9AKDzdmP4tm6Zyge3Fme9KyMRNwXB")
db = deta.Base("web-music")

app = Flask(__name__)
CORS(app)


def music(video_url):
    ydl_opts = {"format": "bestaudio/best"}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(video_url, download=False)
        return info_dict


def ytsearch(kw: str):
    results = YoutubeSearch(kw, max_results=5).to_json()
    return json.loads(results)


@app.route("/")
def home():
    return jsonify(page="home")


@app.route("/search")
def yt_search():
    keyword = request.args.get("kw")
    if keyword:
        return jsonify(ytsearch(keyword))
    return jsonify(
        status="error", message="no keyword to search", resolved=False, status_code=404
    )


@app.route("/get")
def get_music():
    url = request.args.get("url")
    info = music(url)
    return jsonify(
        name=info["title"],
        url=info["url"],
        cover=info.get("thumbnail"),
        artist=info.get("channel"),
    )


@app.route("/add")
def update_album():
    url = request.args.get("url")
    playlist = db.get("playlist")
    if playlist and playlist.get("urls"):
        if url in playlist["urls"]:
            pass
        else:
            playlist["urls"].append(url)
            db.put(playlist)
    else:
        playlist = {"key": "playlist", "urls": [url]}
        db.put(playlist)
    return jsonify(status="success")


@app.route("/list")
def get_album():
    result = db.get("playlist")
    if result.get("urls"):
        return jsonify(result["urls"])
    return jsonify(status="error")


@app.route("/delete")
def delete_music():
    url = request.args.get("url")
    playlist = db.get("playlist")
    if url in playlist["urls"]:
        playlist["urls"].remove(url)
        db.put(playlist)
    return jsonify(status="success")
