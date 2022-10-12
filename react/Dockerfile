FROM node:lts-alpine AS production

RUN mkdir /build-dir
WORKDIR /build-dir
COPY package.json /build-dir
COPY ./webpackDevServer.config.js /build-dir
RUN npm install --location=global npm@8.15.0 && export npm_config_loglevel=silent && npm install --legacy-peer-deps && rm -rf /build-dir/node_modules/react-scripts/config/webpackDevServer.config.js \
    && cp /build-dir/webpackDevServer.config.js /build-dir/node_modules/react-scripts/config/webpackDevServer.config.js

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN ln -s /build-dir/node_modules node_modules
COPY . /usr/src/app

EXPOSE 4200