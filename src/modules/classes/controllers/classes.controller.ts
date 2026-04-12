import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiSuccessResponseDoc } from '../../../common/swagger/api-success-response.decorator';
import type { ApiSuccessResponse } from '../../../common/types';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../../common/guards/auth.guard';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import {
  CreateClassDto,
  JoinClassByCodeDto,
  UpdateClassDto,
} from '../dtos/classes-request.dto';
import {
  ActionMessageResponseDto,
  ClassDetailResponseDto,
  ClassMemberSummaryDto,
  ClassResponseDto,
} from '../dtos/classes-response.dto';
import { ClassesService } from '../services/classes.service';

@ApiTags('Classes')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Authentication token is missing or invalid',
})
@Controller('classes')
@UseGuards(AuthGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a class',
    description:
      'Creates a new class. Teachers can create classes for themselves, while admins can create classes for a selected teacher.',
  })
  @ApiSuccessResponseDoc({
    status: HttpStatus.CREATED,
    description: 'Class created successfully',
    model: ClassDetailResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Students are not allowed to create classes',
  })
  async createClass(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() createClassDto: CreateClassDto,
  ): Promise<ApiSuccessResponse<ClassDetailResponseDto>> {
    return this.ok(
      await this.classesService.createClass(currentUser, createClassDto),
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List accessible classes',
    description:
      'Returns classes accessible to the current user. Admin sees all classes, teacher sees owned classes, student sees joined classes.',
  })
  @ApiSuccessResponseDoc({
    description: 'Classes returned successfully',
    model: ClassResponseDto,
    isArray: true,
  })
  async listClasses(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<ClassResponseDto[]>> {
    return this.ok(await this.classesService.listClasses(currentUser));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get class details',
    description:
      'Returns class details for an accessible class, including schedules and enrolled members.',
  })
  @ApiSuccessResponseDoc({
    description: 'Class details returned successfully',
    model: ClassDetailResponseDto,
  })
  async getClassById(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', ParseIntPipe) classId: number,
  ): Promise<ApiSuccessResponse<ClassDetailResponseDto>> {
    return this.ok(
      await this.classesService.getClassById(currentUser, classId),
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a class',
    description:
      'Updates a class owned by the current teacher or any class for an administrator.',
  })
  @ApiSuccessResponseDoc({
    description: 'Class updated successfully',
    model: ClassDetailResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Students are not allowed to update classes',
  })
  async updateClass(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', ParseIntPipe) classId: number,
    @Body() updateClassDto: UpdateClassDto,
  ): Promise<ApiSuccessResponse<ClassDetailResponseDto>> {
    return this.ok(
      await this.classesService.updateClass(
        currentUser,
        classId,
        updateClassDto,
      ),
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a class',
    description:
      'Deletes a class owned by the current teacher or any class for an administrator.',
  })
  @ApiSuccessResponseDoc({
    description: 'Class deleted successfully',
    model: ActionMessageResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Students are not allowed to delete classes',
  })
  async deleteClass(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', ParseIntPipe) classId: number,
  ): Promise<ApiSuccessResponse<ActionMessageResponseDto>> {
    return this.ok(await this.classesService.deleteClass(currentUser, classId));
  }

  @Post('join')
  @ApiOperation({
    summary: 'Join a class by class code',
    description:
      'Allows a student to join a class by providing a valid class code.',
  })
  @ApiSuccessResponseDoc({
    status: HttpStatus.CREATED,
    description: 'Joined class successfully',
    model: ClassDetailResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Only students are allowed to join classes by class code',
  })
  async joinClassByCode(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() joinClassByCodeDto: JoinClassByCodeDto,
  ): Promise<ApiSuccessResponse<ClassDetailResponseDto>> {
    return this.ok(
      await this.classesService.joinClassByCode(
        currentUser,
        joinClassByCodeDto,
      ),
    );
  }

  @Get(':id/members')
  @ApiOperation({
    summary: 'List class members',
    description:
      'Returns all students in the class for the owner teacher or an administrator.',
  })
  @ApiSuccessResponseDoc({
    description: 'Class members returned successfully',
    model: ClassMemberSummaryDto,
    isArray: true,
  })
  @ApiForbiddenResponse({
    description:
      'Students are not allowed to access the class member management endpoint',
  })
  async listClassMembers(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', ParseIntPipe) classId: number,
  ): Promise<ApiSuccessResponse<ClassMemberSummaryDto[]>> {
    return this.ok(
      await this.classesService.listClassMembers(currentUser, classId),
    );
  }

  @Delete(':id/members/:studentId')
  @ApiOperation({
    summary: 'Remove a student from a class',
    description:
      'Removes a student from the class for the owner teacher or an administrator.',
  })
  @ApiSuccessResponseDoc({
    description: 'Student removed from class successfully',
    model: ActionMessageResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Students are not allowed to remove class members',
  })
  async removeClassMember(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', ParseIntPipe) classId: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ): Promise<ApiSuccessResponse<ActionMessageResponseDto>> {
    return this.ok(
      await this.classesService.removeClassMember(
        currentUser,
        classId,
        studentId,
      ),
    );
  }

  private ok<TData>(data: TData): ApiSuccessResponse<TData> {
    return {
      success: true,
      data,
    };
  }
}
