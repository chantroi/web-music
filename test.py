from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker


Base = declarative_base()


class Author(Base):
    __tablename__ = "authors"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    books = relationship("Book", back_populates="author")


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    author_id = Column(Integer, ForeignKey("authors.id"))
    author = relationship("Author", back_populates="books")


class Database:
    def __init__(self) -> None:
        engine = create_engine("sqlite:///library.db", echo=True)
        Base.metadata.create_all(engine)
        Session = sessionmaker(bind=engine)
        self.session = Session()

    def add_author(self, name: str) -> Author:
        new_author = Author(name=name)
        self.session.add(new_author)
        self.session.commit()
        return new_author

    def add_book(self, author: Author, book_title: str) -> Book:
        book = Book(
            title=book_title, author=author
        )
        self.session.add(book)
        self.session.commit()
        return book

    def get_books(self) -> iter:
        authors = self.session.query(Author).all()
        for author in authors:
            yield f"Author: {author.name}"
            for book in author.books:
                yield f"  Book: {book.title}"

    def delete_author(self, name: str) -> bool:
        author_to_delete = self.session.query(
            Author).filter_by(name=name).first()
        if author_to_delete:
            self.session.delete(author_to_delete)
            self.session.commit()
            print(f"Deleted book: {author_to_delete.title}")
            return True
        else:
            print("Book not found")
            return False

    def delete_book(self, book_title: str) -> bool:
        book_to_delete = self.session.query(
            Book).filter_by(title=book_title).first()

        if book_to_delete:
            self.session.delete(book_to_delete)
            self.session.commit()
            print(f"Deleted book: {book_to_delete.title}")
            return True
        else:
            print("Book not found")
            return False

    def close(self) -> None:
        self.session.close()


db = Database()
for v in db.get_books():
    print(v)
