import yt_dlp
import requests
from flask import Flask, Response, request, jsonify
from flask_cors import CORS
from detastore import Base, Drive

app = Flask(__name__)
CORS(app)


def music(video_url):
    ydl_opts = {"format": "bestaudio/best"}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(video_url, download=False)
        return info_dict


def get_bytes(url: str) -> bytes:
    return requests.get(url, timeout=20).content


@app.route("/")
def home():
    return jsonify(page="home")


@app.route("/put")
def put_music():
    origin = request.args.get("url")
    album = request.args.get("album", "common")
    info = music(origin)
    url = info["url"]
    name = info["title"]
    artist = info.get("channel")
    cover = info.get("thumbnail")
    data = get_bytes(url)
    base = Base(album=album)
    drive = Drive()
    base.put(name, artist, cover)
    drive.put(name, data)
    return jsonify(status="success")


@app.route("/album")
def get_album():
    album = request.args.get("album", "common")
    app_url = request.url
    base = Base(album=album)
    songs = []
    for song in base.list():
        url = f"{app_url}/play/{song['name']}"
        song = {
            "name": song["name"],
            "artist": song["artist"],
            "url": url,
            "cover": song["cover"],
            "theme": "#ebd0c2",
        }
        songs.append(song)
    return jsonify(songs)


@app.route("/album/play/<songname>")
def play_music(songname):
    drive = Drive()
    data = drive.get(songname)
    return Response(data, content_type="audio/mpeg")


@app.route("/delete")
def delete_music():
    songname = request.args.get("name")
    album = request.args.get("album")
    base = Base(album)
    base.delete(songname)
    return jsonify(status="success")


if __name__ == "__main__":
    app.run(port=8080)
