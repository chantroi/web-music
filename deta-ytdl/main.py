import yt_dlp
from flask import Flask, jsonify, request


def music(video_url):
    ydl_opts = {"format": "bestaudio/best"}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(video_url, download=False)
        return info_dict


app = Flask(__name__)


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
