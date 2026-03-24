import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { GetProfileUseCase } from '../../application/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile.use-case';
import { UpdateProfileDto } from '../dtos/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  @Get(':id/profile')
  getProfile(@Param('id', ParseIntPipe) userId: number) {
    return this.getProfileUseCase.execute(userId);
  }

  @Patch(':id/profile')
  updateProfile(
    @Param('id', ParseIntPipe) userId: number,
    @Body() body: UpdateProfileDto,
  ) {
    return this.updateProfileUseCase.execute({ userId, ...body });
  }
}
