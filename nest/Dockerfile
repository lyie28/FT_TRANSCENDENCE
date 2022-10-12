FROM node:lts-alpine AS production

RUN mkdir /build-dir
WORKDIR /build-dir
COPY package.json /build-dir
RUN npm install --location=global npm@8.15.0 && export npm_config_loglevel=silent && npm install --legacy-peer-deps

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN ln -s /build-dir/node_modules node_modules
COPY . /usr/src/app

EXPOSE 3000
CMD ["npm", "start"]
