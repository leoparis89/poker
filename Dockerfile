FROM node:12-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn

COPY . .
RUN yarn test && yarn back:build && yarn front:build

EXPOSE 3000
CMD [ "yarn", "start" ]