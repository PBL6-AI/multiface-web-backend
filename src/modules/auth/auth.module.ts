import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REPOSITORY_TOKENS } from '../../common/constants/repository.tokens';
import { durationToSeconds } from '../../common/utils/duration.util';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RefreshTokenEntity } from '../../packages/infrastructure/entities/refresh-token.entity';
import { TypeOrmAuthRepository } from '../../packages/infrastructure/repositories';
import { UsersModule } from '../users/users.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';

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
  providers: [
    AuthService,
    AuthGuard,
    RolesGuard,
    TypeOrmAuthRepository,
    {
      provide: REPOSITORY_TOKENS.AUTH,
      useExisting: TypeOrmAuthRepository,
    },
  ],
  exports: [AuthService, AuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
