FROM node:current-alpine3.14
WORKDIR /app
COPY package.json .
ENV adtag=a8184a25a40cd4a83fa4e8badd34e56f
RUN npm install
RUN npm i -g nodemon
COPY . .
EXPOSE 8080
CMD ["nodemon","./src/server.js"]