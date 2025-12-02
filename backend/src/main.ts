import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security: Helmet middleware for HTTP headers
  app.use(helmet());

  // CORS configuration
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  app.enableCors({
    origin: (
      origin: string,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      const allowedOrigins = [
        frontendUrl,
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
      ];
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  });

  // Cookie parser
  app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Get port from environment or use default
  const port = configService.get<number>('PORT') || 3001;

  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(
    `📧 Email service: ${configService.get<string>('RESEND_API_KEY') ? 'Configured' : 'Not configured'}`,
  );
  console.log(
    `🗄️  Database: ${configService.get<string>('DATABASE_URL') ? 'Connected' : 'Not connected'}`,
  );
}
bootstrap();
