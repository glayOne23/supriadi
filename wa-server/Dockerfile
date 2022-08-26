FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm instal


COPY . .

EXPOSE 3000
CMD [ "node", "index.js" ]
