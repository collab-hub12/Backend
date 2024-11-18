import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Flint')
    .setDescription('Flint API Documentation')
    .setVersion('1.1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  app.use(cookieParser());
  //cross origin resource sharing
  app.enableCors({
    credentials: true,
    origin: [
      'http://127.0.0.1:3000',
      'https://accounts.google.com/o/oauth2/v2/auth',
    ],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  await app.listen(8000);
}
bootstrap();
