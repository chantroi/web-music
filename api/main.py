import os
import json
import yt_dlp
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_search import YoutubeSearch
from deta import Deta


class DetaObj:
    def __init__(self):
        self.deta = Deta(os.environ["DETA_KEY"])

    def albums(self):
        return self.deta.Base("albums")

    def album(self, album_name):
        for i in self.albums().fetch().items:
            if i["key"] == f"web-music-{album_name}":
                return self.deta.Base(f"web-music-{i['key']}")

    def drive(self):
        return self.deta.Drive("web-music")


app = Flask(__name__)
CORS(app)


def music(video_url):
    ydl_opts = {"format": "bestaudio/best"}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(video_url, download=False)
        return info_dict


def save_music(info, album):
    deta = DetaObj()
    db = deta.album(album)
    drive = deta.drive()
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
    album = request.args.get("a")
    info = music(url)
    save_music(info, album)
    return jsonify(key=info["title"] + ".mp3")


@app.route("/list")
def get_album():
    deta = DetaObj()
    album = request.args.get("a")
    if album:
        db = deta.album(album)
        result = db.fetch().items
        return jsonify(result)
    db = deta.albums()
    result = db.fetch().items
    return jsonify(result)


@app.route("/list/create")
def add_album():
    album = request.args.get("a")
    if album:
        deta = DetaObj()
        db = deta.albums()
        album = db.put(data={"name": album})
        return jsonify(
            status="success", action="add", key=album["key"], name=album["name"]
        )
    return jsonify(status="error", action="add")


@app.route("/delete")
def delete_music():
    album = request.args.get("a")
    deta = DetaObj()
    db = deta.album(album)
    key = request.args.get("key")
    db.delete(key)
    return jsonify(key=key, status="success", action="delete")


@app.route("/comments")
def get_comments():
    deta = Deta(os.environ["DETA_KEY"])
    db = deta.Base("comments")
    result = db.fetch().items
    return jsonify(result)
