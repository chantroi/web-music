from flask import Flask, render_template, request, jsonify, Response
from flask_htmx import HTMX

app = Flask(__name__)
HTMX(app)


@app.route("/")
def home():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(port=5000, debug=True)
