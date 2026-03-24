import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REPOSITORY_TOKENS } from '../../common/constants/repository.tokens';
import {
  RefreshTokenEntity,
  UserEntity,
} from '../../infrastructure/persistence/typeorm/entities';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { AuthTypeOrmRepository } from './infrastructure/persistence/auth.typeorm.repository';
import { AuthController } from './presentation/controllers/auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RefreshTokenEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'multiface-dev-secret',
      signOptions: {
        issuer: 'multiface-backend',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    LogoutUseCase,
    {
      provide: REPOSITORY_TOKENS.AUTH,
      useClass: AuthTypeOrmRepository,
    },
  ],
  exports: [LoginUseCase, LogoutUseCase],
})
export class AuthModule {}
