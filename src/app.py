import concurrent.futures
from flask import Flask, render_template, request, jsonify
from flask_htmx import HTMX
from .db import AlbumDB, Song
from .ytdl import music

app = Flask(__name__)
HTMX(app)
db = AlbumDB()


@app.route("/")
@app.route("/<album>")
def home(album="common"):
    return render_template("index.html", album=album)


@app.route("/list")
def list_():
    album = request.args.get("album")
    pre = None
    songs = []
    if album and album != "common":
        pre = db.list(album)
    else:
        pre = db.list()
    if pre:
        for song in pre:
            song = {
                "name": song.name,
                "artist": song.artist,
                "url": song.url,
                "cover": song.cover,
                "theme": "#ebd0c2",
            }
            songs.append(song)
    songs.reverse()
    return jsonify(songs)


@app.route("/add")
def add_song():
    origin = request.args.get("url")
    album = request.args.get("album")
    if not origin:
        return jsonify(err="no url")
    info = music(origin)
    url = info["url"]
    name = info["title"]
    artist = info.get("channel")
    cover = info.get("thumbnail")
    if album:
        song = Song(
            name=name, artist=artist, url=url, origin=origin, cover=cover, album=album
        )
    else:
        song = Song(name=name, artist=artist, url=url, origin=origin, cover=cover)
    return jsonify(db.add(song))


@app.route("/update")
def update_list():
    def update(song):
        song.url = music(song.url)["url"]
        db.add(song)

    songs = db.list()
    with concurrent.futures.ThreadPoolExecutor(max_workers=100) as ex:
        ex.map(update, songs)
    return songs
