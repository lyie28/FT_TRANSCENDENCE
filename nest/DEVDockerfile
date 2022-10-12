FROM node:lts-alpine AS development

WORKDIR /src/app

COPY package*.json ./

RUN npm install --location=global npm@8.15.0 && export npm_config_loglevel=silent && npm install --legacy-peer-deps
COPY . .

RUN npm run build 

EXPOSE 3000


# FROM node:lts-alpine AS production

# ARG NODE_ENV=production
# ENV NODE_ENV=${NODE_ENV}

# WORKDIR /src/app

# COPY --from=development /src/app/ .

# EXPOSE 3000
