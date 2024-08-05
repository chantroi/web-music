import os
import json

import deta
import yt_dlp
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_search import YoutubeSearch

app = Flask(__name__)
CORS(app)


class Deta:
    def __init__(self):
        self.deta = deta.Deta(os.environ["DETA_KEY"])

    def comments(self):
        return self.deta.Base("comments")

    def bases(self):
        return self.deta.Base("albums")

    def base(self, album_name):
        if album_name == "Common":
            return self.deta.Base("web-music")
        for i in self.bases().fetch().items:
            if i["name"] == album_name:
                return self.deta.Base(f"web-music-{i['key']}")

    def drive(self):
        return self.deta.Drive("web-music")


def music(video_url):
    ydl_opts = {"format": "bestaudio/best"}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(video_url, download=False)
        return info_dict


def save_music(info, album):
    d = Deta()
    db = d.base(album)
    drive = d.drive()
    content = {
        "key": info["title"] + ".mp3",
        "name": info["title"],
        "cover": info.get("thumbnail"),
        "artist": info.get("channel"),
    }
    db.put(content)
    req = requests.get(info["url"], timeout=100)
    data = req.content
    filename = info["title"] + ".mp3"
    if not drive.get(filename):
        drive.put(filename, data)


@app.route("/")
def home():
    return jsonify(page="home")


@app.route("/search", methods=["GET", "POST"])
def yt_search():
    def search(kw: str):
        results = YoutubeSearch(kw, max_results=10).to_json()
        return json.loads(results)

    if request.method == "POST":
        keyword = request.json.get("kw")
    else:
        keyword = request.args.get("kw")
    if keyword:
        return jsonify(search(keyword))
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


@app.route("/album/list")
def get_albums():
    d = Deta()
    db = d.bases()
    result = db.fetch().items
    return jsonify(result)


@app.route("/album/create")
def add_album():
    album = request.args.get("a")
    if album:
        d = Deta()
        db = d.bases()
        album = db.put(data={"name": album})
        return jsonify(
            status="success", action="add", key=album["key"], name=album["name"]
        )
    return jsonify(status="error", action="add")


@app.route("/album/delete")
def delete_album():
    album = request.args.get("a")
    if album:
        d = Deta()
        db = d.bases()
        db.delete(album)
        return jsonify(status="success", action="delete")
    return jsonify(status="error", action="delete")


@app.route("/audio/delete")
def delete_audio():
    audio = request.args.get("audio")
    if audio:
        d = Deta()
        drive = d.drive()
        drive.delete(audio)
        return jsonify(status="success", action="delete")
    return jsonify(status="error", action="delete")


@app.route("/comment/all")
def get_comments():
    d = Deta()
    db = d.comments()
    result = db.fetch().items
    return jsonify(result)
