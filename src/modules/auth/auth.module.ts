import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard, RolesGuard } from '../../common/guards';
import { durationToSeconds } from '../../common/utils';
import { RefreshTokenEntity } from '../../packages/infrastructure/entities';
import { useAuthRepository } from '../../packages/infrastructure/repositories';
import { UsersModule } from '../users';
import { AuthController } from './controllers';
import { AuthService } from './services';

@Global()
@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([RefreshTokenEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('auth.accessTokenSecret') ??
          'multiface-access-secret-dev',
        signOptions: {
          expiresIn: durationToSeconds(
            configService.get<string>('auth.accessTokenExpiresIn'),
            15 * 60,
          ),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, RolesGuard, useAuthRepository()],
  exports: [AuthService, AuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
