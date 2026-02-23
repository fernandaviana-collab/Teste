'use strict';

/**
 * Vercel Serverless Function - NestJS Handler
 *
 * Este arquivo é o entry point para todas as requisições /api/* no Vercel.
 * O app NestJS é criado uma vez e reutilizado nas chamadas subsequentes
 * (warm starts) para reduzir latência de cold start.
 *
 * Build: o NestJS é compilado para apps/api/dist/ antes do deploy.
 * O Vercel inclui esses arquivos via "includeFiles" em vercel.json.
 */

const express = require('express');

let cachedApp = null;

async function getApp() {
  if (cachedApp) return cachedApp;

  const { NestFactory } = require('@nestjs/core');
  const { ExpressAdapter } = require('@nestjs/platform-express');
  const { ValidationPipe } = require('@nestjs/common');
  const { AppModule } = require('../apps/api/dist/app.module');

  const expressApp = express();

  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { logger: ['error', 'warn'] },
  );

  nestApp.setGlobalPrefix('api');

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : true; // true = reflexivo (aceita qualquer origem) — restringir em produção

  nestApp.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  nestApp.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  await nestApp.init();

  cachedApp = expressApp;
  return cachedApp;
}

module.exports = async (req, res) => {
  try {
    const app = await getApp();
    app(req, res);
  } catch (err) {
    console.error('[Vercel Handler] Bootstrap error:', err);
    res.status(500).json({ message: 'Internal server error during initialization' });
  }
};
