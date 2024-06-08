FROM python

COPY requirements.txt .
COPY ./src/server/* .

RUN pip install -r requirements.txt
EXPOSE 8080

CMD python -m gunicorn -b 0.0.0.0:8080 main:app