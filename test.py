from youtube_search import YoutubeSearch
import json

results = YoutubeSearch("nguoi la oi", max_results=1).to_json()

with open("result.json", "w") as f:
    json.dump(json.loads(results), f)
