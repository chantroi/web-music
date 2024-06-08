from .client import deta


class Base:
    def __init__(self, album: str = "common"):
        self.album = album
        self.b = deta.Base("music")

    def put(
        self,
        filename: str,
        artist: str = None,
        cover: str = None,
    ) -> None:
        key = filename + self.album
        file = dict(
            key=key, name=filename, artist=artist, cover=cover, album=self.album
        )
        self.b.put(file)

    def get(self, key: str):
        return self.b.get(key)

    def list(self) -> list:
        list = self.b.fetch({"album": self.album})
        return list.items

    def delete(self, filename: str) -> None:
        self.b.delete(filename + self.album)
