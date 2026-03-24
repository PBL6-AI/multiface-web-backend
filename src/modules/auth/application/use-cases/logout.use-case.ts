import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../../common/constants/repository.tokens';
import { UseCase } from '../../../../common/interfaces/use-case.interface';
import type { IAuthRepository } from '../../core/interfaces/auth.repository.interface';

interface LogoutInput {
  refreshToken: string;
}

@Injectable()
export class LogoutUseCase implements UseCase<LogoutInput, void> {
  constructor(
    @Inject(REPOSITORY_TOKENS.AUTH)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(input: LogoutInput): Promise<void> {
    await this.authRepository.revokeRefreshToken(input.refreshToken);
  }
}
