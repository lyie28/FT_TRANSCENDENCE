import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource, getRepository } from 'typeorm';
import { AppModule } from './app.module';
import { TypeORMSession } from './typeorm/entities/Session';
import * as session from 'express-session';
import * as passport from 'passport';
import * as express from "express";
import { join } from 'path';
import * as multer from 'multer';
import * as bodyParser from 'body-parser';
import { ConfigService } from '@nestjs/config';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
     bodyParser: true});
  const configService = app.get(ConfigService);
  /*set up cookies so we remember users are logged in*/
  app.use(
    session({
      cookie: {
       maxAge: 86400000,
      },
      //used to encrypt cookie, can be anything but keep secret
      secret: configService.get('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.enableCors({
    origin: 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();