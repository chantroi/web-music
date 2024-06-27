import os
from deta import Deta


class Album:
    def __init__(self):
        deta = Deta("c0kEEGmHJte_YjH9AKDzdmP4tm6Zyge3Fme9KyMRNwXB")
        self.db = deta.Base("web-music")

    def get(self, name: str):
        return self.db.get(name)

    def put(self, name: str, url: str):
        album = self.get(name)
        if album:
            if url in self.list(name):
                return
            album["list"].append(url)
        else:
            album = dict(key=name, list=[url])
        return self.db.put(album)

    def list(self, name: str):
        album = self.get(name)
        return album["list"]

    def delete(self, name: str, url: str):
        album = self.get(name)
        album["list"].remove(url)
        return self.db.put(album)

    def albums(self):
        all_album = self.db.fetch()
        return all_album.items
