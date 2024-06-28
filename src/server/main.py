import json
import yt_dlp
from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_search import YoutubeSearch

try:
    from base import Album
except:
    from .base import Album

app = Flask(__name__)
CORS(app)


def music(video_url):
    ydl_opts = {"format": "bestaudio/best"}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(video_url, download=False)
        return info_dict


def ytsearch(kw):
    results = YoutubeSearch("nguoi la oi", max_results=5).to_json()
    return json.loads(results)


@app.route("/")
def home():
    return jsonify(page="home")


@app.route("/search")
def yt_search():
    keyword = request.args.get("kw")
    if keyword:
        return jsonify(ytsearch(keyword))
    else:
        return jsonify(status="error", message="no keyword to search")


@app.route("/get")
def get_music():
    url = request.args.get("url")
    info = music(url)
    return jsonify(
        url=info["url"],
        name=info["title"],
        artist=info.get("channel"),
        cover=info.get("thumbnail"),
    )


@app.route("/album/add")
def update_album():
    album = Album()
    name = request.args.get("album")
    url = request.args.get("url")
    album.put(name, url)
    return jsonify(status="success")


@app.route("/album/get")
def get_album():
    album = Album()
    return jsonify(album.albums())


@app.route("/album/delete")
def delete_music():
    album = Album()
    url = request.args.get("url")
    name = request.args.get("album")
    album.delete(name, url)
    return jsonify(status="success")

