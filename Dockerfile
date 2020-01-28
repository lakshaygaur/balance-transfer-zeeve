FROM node:8.9.0


#COPY package*.json ./
WORKDIR /balance-transfer

COPY . .
ENV PORT=4000
CMD npm install && node app
