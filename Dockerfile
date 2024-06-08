FROM python:3.10

RUN useradd -m -u 1000 user
COPY . /home/user/bot
WORKDIR /home/user/bot

RUN pip install -r requirements.txt
RUN chown -R user:user /home/user/bot
WORKDIR /home/user/bot/src/server
EXPOSE 8080

CMD python -m gunicorn -b :8080 main:app