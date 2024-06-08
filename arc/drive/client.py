import os
import requests


class Drive:
    def __init__(self) -> None:
        self.url = os.environ["DRIVE"]

    def get(self, album: str = "common") -> str:
        req = requests.get(self.url, params={"album": album}, timeout=20)
        res = req.json()
        return res["list"]

    def put(self, file: dict) -> None:
        requests.post(self.url, json=file, timeout=20)

    def delete(self, filename: str) -> None:
        requests.delete(self.url, params={"file": filename}, timeout=20)
