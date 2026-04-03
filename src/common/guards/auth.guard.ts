import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { REPOSITORY_TOKENS } from '../constants/repository.tokens';
import { IS_PUBLIC_KEY } from '../decorators/is-public.decorator';
import type { UsersRepository } from '../../packages/domain/repositories';
import {
  AuthenticatedRequest,
  AuthenticatedUser,
} from '../../modules/auth/interfaces/authenticated-user.interface';

type JwtPayload = {
  sub: number;
  userCode: string;
  email: string;
  role: string;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REPOSITORY_TOKENS.USERS)
    private readonly usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractAccessToken(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token is required');
    }

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret:
          this.configService.get<string>('auth.accessTokenSecret') ??
          'multiface-access-secret-dev',
      });
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired authentication token',
      );
    }

    const user = await this.usersRepository.findById(payload.sub);

    if (!user?.role) {
      throw new UnauthorizedException('Authenticated user no longer exists');
    }

    request.user = this.buildAuthenticatedUser(user);
    return true;
  }

  private extractAccessToken(request: Request): string | null {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      return null;
    }

    const [scheme, token] = authorizationHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }

  private buildAuthenticatedUser(user: {
    id: number;
    userCode: string;
    email: string;
    fullName: string;
    roleId: number;
    role: { name: string };
  }): AuthenticatedUser {
    return {
      id: user.id,
      userCode: user.userCode,
      email: user.email,
      fullName: user.fullName,
      role: user.role.name.toLowerCase() as AuthenticatedUser['role'],
      roleId: user.roleId,
    };
  }
}
