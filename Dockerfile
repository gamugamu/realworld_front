FROM node:alpine

EXPOSE 8080 443

ADD . /app
WORKDIR /app
RUN ls /app
RUN npm install
CMD npm run dev
