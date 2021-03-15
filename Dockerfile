FROM node:12-alpine

WORKDIR /usr/src/app
COPY . .
RUN yarn

# TODO Reoptimize like this
# COPY package.json yarn.lock ./
# RUN yarn
# COPY . .


ENV POI_APP_GOOGLE_AUTH_URL="https://poker.levk.me/auth/google"
ENV POI_APP_SOCKET_IO_URL="https://poker.levk.me"


RUN yarn test && \
    yarn workspace back build && \
    yarn workspace front build

EXPOSE 3000
CMD [ "yarn", "workspace", "back", "start" ]