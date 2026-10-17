import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((value) => value.trim()).filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:3001'];
  app.enableCors({ origin: allowedOrigins });

  const port = Number(process.env.PORT || 3000);
  await app.listen(port, '0.0.0.0');
  console.log('API running on port ' + port);
}

bootstrap();
