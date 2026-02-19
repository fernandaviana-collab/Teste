import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Swagger docs
  const config = new DocumentBuilder()
    .setTitle('FastTeam API')
    .setDescription('API da plataforma FastTeam - Gestão de Pessoas para Fast Food')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticação')
    .addTag('companies', 'Empresas')
    .addTag('stores', 'Lojas')
    .addTag('users', 'Usuários')
    .addTag('jobs', 'Vagas')
    .addTag('candidates', 'Candidatos')
    .addTag('employees', 'Funcionários')
    .addTag('intermittent', 'Trabalhadores Intermitentes')
    .addTag('gamification', 'Gamificação')
    .addTag('dashboard', 'Dashboard')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 FastTeam API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
