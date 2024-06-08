from .client import deta


class Drive:
    def __init__(self) -> None:
        self.d = deta.Drive("music")

    def put(self, filename: str, data: bytes):
        if self.get(filename):
            return
        self.d.put(filename, data, content_type="audio/mpeg")

    def get(self, filename: str):
        file = self.d.get(filename)
        if file:
            return file.read()
