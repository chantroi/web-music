from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Song(Base):
    __tablename__ = "songs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)
    artist = Column(String, nullable=True)
    url = Column(String)
    origin = Column(String)
    cover = Column(String, nullable=True)
    album = Column(String, default="common")

    def json(self) -> dict:
        return dict(
            id=self.id,
            name=self.name,
            artist=self.artist,
            url=self.url,
            origin=self.origin,
            cover=self.cover,
            album=self.album,
        )
