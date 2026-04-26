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
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { ApiSuccessResponse } from '../../../common/types';
import { CurrentUser, Roles } from '../../../common/decorators';
import { AuthGuard, RolesGuard } from '../../../common/guards';
import { ApiSuccessResponseDoc } from '../../../common/swagger';
import type { AuthenticatedUser } from '../../auth/interfaces';
import {
  CreateUserDto,
  ListUsersQueryDto,
  UpdateProfileDto,
  UpdateUserDto,
  UserResponseDto,
} from '../dtos';
import { UsersService } from '../services';

@ApiTags('Users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Authentication token is missing or invalid',
})
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get my profile',
    description: 'Returns the profile of the currently authenticated user.',
  })
  @ApiSuccessResponseDoc({
    description: 'Profile returned successfully',
    model: UserResponseDto,
  })
  async getMyProfile(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<UserResponseDto>> {
    return this.ok(await this.usersService.getProfile(currentUser.id));
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Update my profile',
    description: 'Updates the profile of the currently authenticated user.',
  })
  @ApiSuccessResponseDoc({
    description: 'Profile updated successfully',
    model: UserResponseDto,
  })
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
  @ApiOperation({
    summary: 'Create a user',
    description: 'Allows an administrator to create a new user account.',
  })
  @ApiSuccessResponseDoc({
    status: 201,
    description: 'User created successfully',
    model: UserResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can access this endpoint',
  })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiSuccessResponse<UserResponseDto>> {
    return this.ok(
      await this.usersService.serializeUser(
        await this.usersService.createUserByAdmin(createUserDto),
      ),
    );
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'List users',
    description: 'Returns all users, optionally filtered by role.',
  })
  @ApiSuccessResponseDoc({
    description: 'Users returned successfully',
    model: UserResponseDto,
    isArray: true,
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can access this endpoint',
  })
  async listUsers(
    @Query() query: ListUsersQueryDto,
  ): Promise<ApiSuccessResponse<UserResponseDto[]>> {
    return this.ok(await this.usersService.listUsers(query));
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Get a user by id',
    description: 'Returns a single user profile by identifier.',
  })
  @ApiSuccessResponseDoc({
    description: 'User returned successfully',
    model: UserResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can access this endpoint',
  })
  async getUserById(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<ApiSuccessResponse<UserResponseDto>> {
    return this.ok(await this.usersService.getUserById(userId));
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Update a user by id',
    description: 'Allows an administrator to update a user profile and role.',
  })
  @ApiSuccessResponseDoc({
    description: 'User updated successfully',
    model: UserResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can access this endpoint',
  })
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
