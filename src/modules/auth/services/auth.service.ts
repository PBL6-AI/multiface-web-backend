import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type {
  RawRefreshTokenEntity,
  RawUserEntity,
  AuthRepository,
} from '../../../packages/domain';
import { REPOSITORY_TOKENS } from '../../../common/constants';
import {
  durationToSeconds,
  hashSecret,
  verifySecret,
} from '../../../common/utils';
import { UsersService } from '../../users/services';
import {
  ChangePasswordDto,
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  RegisterDto,
  LoginResponseDto,
  LogoutResponseDto,
  RefreshTokenResponseDto,
  RegisterResponseDto,
} from '../dtos';
import { UserResponseDto } from '../../users/dtos';

type JwtPayload = {
  sub: number;
  userCode: string;
  email: string;
  role: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REPOSITORY_TOKENS.AUTH)
    private readonly authRepository: AuthRepository,
  ) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('Password confirmation does not match');
    }

    const user = await this.usersService.createSelfRegisteredUser(registerDto);
    return this.usersService.serializeUser(user);
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findForAuthentication(
      loginDto.userCode,
    );

    if (!user || !(await verifySecret(loginDto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid user code or password');
    }

    return this.buildTokenResponse(user);
  }

  async refreshTokens(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    const payload = await this.verifyRefreshToken(refreshTokenDto.refreshToken);
    const user = await this.usersService.findByIdOrThrow(payload.sub);
    const storedToken = await this.findMatchingRefreshToken(
      user.id,
      refreshTokenDto.refreshToken,
      true,
    );

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token is no longer valid');
    }

    await this.authRepository.revokeRefreshTokenById(storedToken.id);

    return this.buildTokenResponse(user);
  }

  async logout(
    userId: number,
    logoutDto: LogoutDto,
  ): Promise<LogoutResponseDto> {
    if (logoutDto.refreshToken) {
      const storedToken = await this.findMatchingRefreshToken(
        userId,
        logoutDto.refreshToken,
        false,
      );

      if (storedToken && !storedToken.revokedAt) {
        await this.authRepository.revokeRefreshTokenById(storedToken.id);
      }

      return { message: 'Logged out successfully' };
    }

    await this.authRepository.revokeActiveRefreshTokensByUserId(userId);

    return { message: 'Logged out successfully' };
  }

  async getCurrentUser(userId: number): Promise<UserResponseDto> {
    return this.usersService.getProfile(userId);
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    if (
      changePasswordDto.newPassword !== changePasswordDto.confirmNewPassword
    ) {
      throw new BadRequestException('New password confirmation does not match');
    }

    const user = await this.usersService.findForAuthenticationById(userId);

    if (
      !(await verifySecret(
        changePasswordDto.currentPassword,
        user.passwordHash,
      ))
    ) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (await verifySecret(changePasswordDto.newPassword, user.passwordHash)) {
      throw new BadRequestException(
        'New password must be different from the current password',
      );
    }

    user.passwordHash = await hashSecret(changePasswordDto.newPassword);
    await this.usersService.saveUser(user);
    await this.authRepository.revokeActiveRefreshTokensByUserId(user.id);

    return { success: true };
  }

  private async buildTokenResponse(
    user: RawUserEntity,
  ): Promise<LoginResponseDto> {
    const jwtPayload = this.buildJwtPayload(user);
    const accessToken = await this.jwtService.signAsync(jwtPayload, {
      secret:
        this.configService.get<string>('auth.accessTokenSecret') ??
        'multiface-access-secret-dev',
      expiresIn: durationToSeconds(
        this.configService.get<string>('auth.accessTokenExpiresIn'),
        15 * 60,
      ),
    });

    const refreshToken = await this.jwtService.signAsync(jwtPayload, {
      secret:
        this.configService.get<string>('auth.refreshTokenSecret') ??
        'multiface-refresh-secret-dev',
      expiresIn: durationToSeconds(
        this.configService.get<string>('auth.refreshTokenExpiresIn'),
        7 * 24 * 60 * 60,
      ),
    });

    const decodedRefreshToken = this.jwtService.decode<{ exp: number }>(
      refreshToken,
    );

    if (
      !decodedRefreshToken ||
      typeof decodedRefreshToken !== 'object' ||
      typeof decodedRefreshToken.exp !== 'number'
    ) {
      throw new UnauthorizedException('Unable to issue refresh token');
    }

    await this.authRepository.createRefreshToken({
      userId: user.id,
      token: await hashSecret(refreshToken),
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
    });

    return {
      accessToken,
      refreshToken,
      user: this.usersService.serializeUser(user),
    };
  }

  private buildJwtPayload(user: RawUserEntity): JwtPayload {
    return {
      sub: user.id,
      userCode: user.userCode,
      email: user.email,
      role: user.role.name.toLowerCase(),
    };
  }

  private async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret:
          this.configService.get<string>('auth.refreshTokenSecret') ??
          'multiface-refresh-secret-dev',
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async findMatchingRefreshToken(
    userId: number,
    refreshToken: string,
    onlyActive: boolean,
  ): Promise<RawRefreshTokenEntity | null> {
    const tokens = await this.authRepository.findRefreshTokensByUserId(userId, {
      onlyActive,
    });

    for (const token of tokens) {
      if (onlyActive && token.expiresAt <= new Date()) {
        continue;
      }

      if (await verifySecret(refreshToken, token.token)) {
        return token;
      }
    }

    return null;
  }
}
