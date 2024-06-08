FROM python

COPY . /bot
WORKDIR /bot
RUN pip install -r requirements.txt
WORKDIR /bot/src/server
EXPOSE 8080

CMD python -m gunicorn -b 0.0.0.0:8080 main:app