FROM node:10.12.0-stretch
RUN apt update -y && \
    apt install -y \
    procps  \
    joe

ENV APP_DIR=/code
WORKDIR $APP_DIR

RUN yarn global add nodemon
RUN yarn global add babel-cli

ADD package.json package.json
ADD yarn.lock yarn.lock

RUN yarn install

ADD . $APP_DIR
