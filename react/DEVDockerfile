FROM node:lts-alpine AS development

WORKDIR /react/src/app

COPY package*.json ./

# ENV PATH /react/src/app/node_modules/.bin:$PATH

RUN npm install --location=global npm@8.15.0 && export npm_config_loglevel=silent && npm install --legacy-peer-deps

COPY . ./
