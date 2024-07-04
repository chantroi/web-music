FROM python

RUN useradd -m -u 1000 user
WORKDIR /home/user/app
COPY . .
RUN pip install -r requirements.txt

EXPOSE 8080
RUN chown -R user:user /home/user/app
WORKDIR /home/user/app/api

USER user
CMD python -m gunicorn -b 0.0.0.0:8080 main:app