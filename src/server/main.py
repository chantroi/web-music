import yt_dlp
from flask import Flask, request, jsonify
from flask_cors import CORS

try:
    from base import Album
except:
    from .base import Album

app = Flask(__name__)
CORS(app)
album = Album()


def music(video_url):
    ydl_opts = {"format": "bestaudio/best"}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(video_url, download=False)
        return info_dict


@app.route("/")
def home():
    return jsonify(page="home")


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
    name = request.args.get("album")
    url = request.args.get("url")
    album.put(name, url)
    return jsonify(status="success")


@app.route("/album/get")
def get_album():
    name = request.args.get("album", "common")
    return jsonify(album.list(name))


@app.route("/album/delete")
def delete_music():
    url = request.args.get("url")
    name = request.args.get("album")
    album.delete(name, url)
    return jsonify(status="success")
