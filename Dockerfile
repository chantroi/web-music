FROM python:3.10

WORKDIR /bot
COPY . /bot

RUN pip install -r requirements.txt
WORKDIR /bot/src/server
EXPOSE 8080

CMD python -m gunicorn -b :8080 main:app