FROM python

RUN useradd -m -u 1000 user
ENV HOME=/home/user/app
WORKDIR $HOME
COPY . .
RUN pip install -r requirements.txt

EXPOSE 8080
RUN chown -R user:user /home/user/content
WORKDIR $HOME/src/server

USER user
CMD python -m gunicorn -b 0.0.0.0:8080 main:app