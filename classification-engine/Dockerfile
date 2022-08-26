FROM python:3.9.9-slim

# Create a directory named flask
RUN mkdir app

# WORKDIR /app
# Copy everything to flask folder
COPY . /app/

# COPY . .

WORKDIR /app

# COPY /home/ubuntu/model_bkp /app/suicide_engine/ai_resources/model

RUN pip install --upgrade pip

RUN pip install -r requirements.txt

RUN apt update -y && apt install make -y && apt install gunicorn -y

RUN export LC_ALL=C


RUN make install

ENV PORT=3000

CMD ["make", "start"]
