FROM python

COPY . .

RUN pip install -r --no-cache-dir requirements.txt

EXPOSE 8080

CMD python -m gunicorn -b 0.0.0.0:8080 main:app