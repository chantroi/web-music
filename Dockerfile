FROM python

COPY . .
RUN pip install -r requirements.txt
EXPOSE 8080

WORKDIR /src/server
CMD python -m gunicorn -b 0.0.0.0:8080 main:app