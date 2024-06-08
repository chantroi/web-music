import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .model import Base, Song


class AlbumDB:
    def __init__(self) -> None:
        db_url = os.environ["DB_URL"]
        engine = create_engine(db_url)
        Base.metadata.create_all(engine)
        Session = sessionmaker(bind=engine)
        self.session = Session()

    def add(self, song: Song) -> dict:
        self.session.merge(song)
        self.session.commit()
        return song.json()

    def list(self, album: str = None) -> list:
        if album:
            songs = self.session.query(Song).filter_by(album=album).all()
        else:
            songs = self.session.query(Song).all()
        return songs
