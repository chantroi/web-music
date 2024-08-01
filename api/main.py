import os
import json
import yt_dlp
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_search import YoutubeSearch
from deta import Deta


def obj():
    deta = Deta(os.environ["DETA_KEY"])
    db = deta.Base("web-music")
    drive = deta.Drive("web-music")
    return db, drive


app = Flask(__name__)
CORS(app)


def music(video_url):
    ydl_opts = {"format": "bestaudio/best"}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(video_url, download=False)
        return info_dict


def save_music(info):
    db, drive = obj()
    content = {
        "key": info["title"] + ".mp3",
        "name": info["title"],
        "cover": info.get("thumbnail"),
        "artist": info.get("channel"),
    }
    db.put(content)
    req = requests.get(info["url"], timeout=100)
    data = req.content
    drive.put(info["title"] + ".mp3", data)


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
    save_music(info)
    return jsonify(key=info["title"] + ".mp3")


@app.route("/list")
def get_album():
    db, _ = obj()
    result = db.fetch().items
    return jsonify(result)


@app.route("/delete")
def delete_music():
    db, drive = obj()
    key = request.args.get("key")
    db.delete(key)
    drive.delete(key)
    return jsonify(key=key, status="success", action="delete")
