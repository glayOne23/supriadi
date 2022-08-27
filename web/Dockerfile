FROM python:3.8-slim-bullseye
ENV PYTHONUNBUFFERED 1

# install dependencies
RUN apt-get install curl
RUN apt-get update

RUN apt-get install -y ca-certificates gcc musl-dev \
    libffi-dev\
    libxml2-dev libxslt-dev python3-dev \    
    tk-dev tcl-dev default-libmysqlclient-dev \
    unixodbc unixodbc-dev freetds-dev freetds-bin tdsodbc \
    && pip install -U  --no-cache-dir  --no-warn-script-location pip \    
    && pip install -U  --no-cache-dir  --no-warn-script-location setuptools

# Setup application
WORKDIR /var/www/app
# COPY requirements.txt /var/www/app/
COPY . .
COPY main_frontend/settings_docker.py main_frontend/settings.py
RUN chown www-data.www-data /var/www
USER www-data
RUN pip install  --no-cache-dir  --no-warn-script-location -r requirements.txt


# run django
# CMD exec uvicorn mykurikulum.asgi:application --root-path=/app --host=0.0.0.0 --port=8000
# CMD exec uwsgi --http :8000 --module mykurikulum.wsgi --static-map /static=/app/static --static-map /media=/app/media --mime-file /app/mime.types -p 4 -t 900 --buffer-size=32768

