FROM python

COPY . .

RUN pip install -r --no-cache-dir requirements.txt

CMD python -m gunicorn -b 0.0.0.0:8080 main:app