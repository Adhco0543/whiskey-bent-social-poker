import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    console.log('Starting NestJS application...');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('PORT:', process.env.PORT || 3000);
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

    console.log('Creating NestFactory app...');
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe());
    app.enableCors();

    console.log('Listening on port', process.env.PORT || 3000);
    await app.listen(process.env.PORT || 3000);
    console.log(`API running on port ${process.env.PORT || 3000}`);
  } catch (error) {
    console.error('Bootstrap error:');
    if (error instanceof Error) {
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    } else {
      console.error('Unknown error type:', typeof error);
      console.error('Error:', error);
    }
    process.exit(1);
  }
}

bootstrap();
