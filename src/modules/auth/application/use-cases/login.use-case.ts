import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { REPOSITORY_TOKENS } from '../../../../common/constants/repository.tokens';
import { UseCase } from '../../../../common/interfaces/use-case.interface';
import type { IAuthRepository } from '../../core/interfaces/auth.repository.interface';

interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class LoginUseCase implements UseCase<LoginInput, LoginOutput> {
  constructor(
    @Inject(REPOSITORY_TOKENS.AUTH)
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.authRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Placeholder until PasswordHasher service (bcrypt/argon2) is added.
    const isValidPassword = input.password === user.passwordHash;
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessTokenExpiresIn = 60 * 60;
    const refreshTokenExpiresIn = 60 * 60 * 24 * 7;

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: accessTokenExpiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(
      { ...payload, type: 'refresh' },
      {
        expiresIn: refreshTokenExpiresIn,
      },
    );

    await this.authRepository.saveRefreshToken(
      user.id,
      refreshToken,
      new Date(Date.now() + refreshTokenExpiresIn * 1000),
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTokenExpiresIn,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }
}
