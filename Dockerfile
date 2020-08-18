FROM node:12-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn

ENV POI_APP_GOOGLE_AUTH_URL="https://poker.levk.me/auth/google"
ENV POI_APP_SOCKET_IO_URL="https://poker.levk.me"
COPY . .
RUN yarn test && yarn back:build && yarn front:build

EXPOSE 3000
CMD [ "yarn", "start" ]