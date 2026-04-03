import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { ApiSuccessResponse } from '../../../common/types';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import {
  CreateUserDto,
  ListUsersQueryDto,
  UpdateProfileDto,
  UpdateUserDto,
} from '../dtos/users-request.dto';
import type { UserResponseDto } from '../dtos/users-response.dto';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async getMyProfile(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<UserResponseDto>> {
    return this.ok(await this.usersService.getProfile(currentUser.id));
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMyProfile(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ApiSuccessResponse<UserResponseDto>> {
    return this.ok(
      await this.usersService.updateProfile(currentUser.id, updateProfileDto),
    );
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiSuccessResponse<UserResponseDto>> {
    return this.ok(
      this.usersService.serializeUser(
        await this.usersService.createUserByAdmin(createUserDto),
      ),
    );
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async listUsers(
    @Query() query: ListUsersQueryDto,
  ): Promise<ApiSuccessResponse<UserResponseDto[]>> {
    return this.ok(await this.usersService.listUsers(query));
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async getUserById(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<ApiSuccessResponse<UserResponseDto>> {
    return this.ok(await this.usersService.getUserById(userId));
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async updateUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiSuccessResponse<UserResponseDto>> {
    return this.ok(await this.usersService.updateUser(userId, updateUserDto));
  }

  private ok<TData>(data: TData): ApiSuccessResponse<TData> {
    return {
      success: true,
      data,
    };
  }
}
