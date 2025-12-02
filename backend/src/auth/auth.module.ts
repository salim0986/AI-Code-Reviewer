import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { EmailModule } from '../email/email.module';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN') as any,
        },
      }),
      inject: [ConfigService],
    }),
    EmailModule,
    SessionsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshJwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
