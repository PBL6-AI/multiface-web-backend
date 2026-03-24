import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { LoginDto } from '../dtos/login.dto';
import { LogoutDto } from '../dtos/logout.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginDto) {
    return this.loginUseCase.execute(body);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() body: LogoutDto): Promise<void> {
    await this.logoutUseCase.execute(body);
  }
}
