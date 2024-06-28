import json
import yt_dlp
from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_search import YoutubeSearch
from deta import Deta
from pydantic import BaseModel


class Song(BaseModel):
    key: str
    name: str
    artist: str
    url: str
    cover: str


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


@app.route("/add")
def update_album():
    url = request.args.get("url")
    name = request.args.get("name")
    artist = request.args.get("artist")
    cover = request.args.get("cover")
    song = Song(key=url, name=name, artist=artist, url=url, cover=cover)
    db.put(song)
    return jsonify(status="success")


@app.route("/list")
def get_album():
    result = db.fetch().items
    return jsonify(result)


@app.route("/delete")
def delete_music():
    key = request.args.get("name")
    db.delete(key)
    return jsonify(status="success")
