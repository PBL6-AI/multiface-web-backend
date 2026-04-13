import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../common/constants';
import type {
  RawClassEntity,
  RawClassScheduleEntity,
  ClassesRepository,
  UpsertClassScheduleRecordInput,
} from '../../../packages/domain';
import type { AuthenticatedUser } from '../../auth/interfaces';
import { CreateClassDto, JoinClassByCodeDto, UpdateClassDto } from '../dtos';

@Injectable()
export class ClassesService {
  constructor(
    @Inject(REPOSITORY_TOKENS.CLASSES)
    private readonly classesRepository: ClassesRepository,
  ) {}

  async createClass(
    currentUser: AuthenticatedUser,
    createClassDto: CreateClassDto,
  ) {
    this.ensureCanManageClasses(currentUser);

    const teacherId = await this.resolveTeacherIdForCreate(
      currentUser,
      createClassDto.teacherId,
    );
    const classCode = await this.resolveAvailableClassCode(
      createClassDto.classCode,
    );
    const schedules = this.normalizeSchedules(createClassDto.schedules ?? []);

    const createdClass = await this.classesRepository.createClass({
      className: this.normalizeRequiredText(
        createClassDto.className,
        'Class name',
      ),
      classCode,
      teacherId,
      description: this.normalizeNullableText(createClassDto.description),
      schedules,
    });

    return this.serializeClassDetail(createdClass);
  }

  async listClasses(currentUser: AuthenticatedUser) {
    const classes =
      currentUser.role === 'admin'
        ? await this.classesRepository.listAll()
        : currentUser.role === 'teacher'
          ? await this.classesRepository.listByTeacherId(currentUser.id)
          : await this.classesRepository.listByStudentId(currentUser.id);

    return classes.map((classEntity) => this.serializeClass(classEntity));
  }

  async getClassById(currentUser: AuthenticatedUser, classId: number) {
    const classEntity = await this.findAccessibleClassOrThrow(
      currentUser,
      classId,
    );
    return this.serializeClassDetail(classEntity);
  }

  async updateClass(
    currentUser: AuthenticatedUser,
    classId: number,
    updateClassDto: UpdateClassDto,
  ) {
    this.ensureCanManageClasses(currentUser);

    const classEntity = await this.findManageableClassOrThrow(
      currentUser,
      classId,
    );

    if (updateClassDto.className !== undefined) {
      classEntity.className = this.normalizeRequiredText(
        updateClassDto.className,
        'Class name',
      );
    }

    if (updateClassDto.classCode !== undefined) {
      const normalizedClassCode = this.normalizeClassCode(
        updateClassDto.classCode,
      );

      if (normalizedClassCode !== classEntity.classCode) {
        await this.ensureClassCodeAvailable(
          normalizedClassCode,
          classEntity.id,
        );
        classEntity.classCode = normalizedClassCode;
      }
    }

    if (updateClassDto.description !== undefined) {
      classEntity.description = this.normalizeNullableText(
        updateClassDto.description,
      );
    }

    if (updateClassDto.teacherId !== undefined) {
      classEntity.teacherId = await this.resolveTeacherIdForUpdate(
        currentUser,
        classEntity.teacherId,
        updateClassDto.teacherId,
      );
    }

    const schedules =
      updateClassDto.schedules !== undefined
        ? this.normalizeSchedules(updateClassDto.schedules)
        : undefined;

    const updatedClass = await this.classesRepository.saveClass(
      classEntity,
      schedules,
    );
    return this.serializeClassDetail(updatedClass);
  }

  async deleteClass(currentUser: AuthenticatedUser, classId: number) {
    this.ensureCanManageClasses(currentUser);
    const classEntity = await this.findManageableClassOrThrow(
      currentUser,
      classId,
    );
    await this.classesRepository.deleteClass(classEntity);

    return {
      message: 'Class deleted successfully',
    };
  }

  async joinClassByCode(
    currentUser: AuthenticatedUser,
    joinClassByCodeDto: JoinClassByCodeDto,
  ) {
    if (currentUser.role !== 'student') {
      throw new ForbiddenException(
        'Only students can join classes by class code',
      );
    }

    const classCode = this.normalizeClassCode(joinClassByCodeDto.classCode);
    const classEntity = await this.classesRepository.findByClassCode(classCode);

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    const existingMembership = await this.classesRepository.findMember(
      classEntity.id,
      currentUser.id,
    );

    if (existingMembership) {
      throw new ConflictException('You have already joined this class');
    }

    await this.classesRepository.addMember(classEntity.id, currentUser.id);
    const joinedClass = await this.findAccessibleClassOrThrow(
      currentUser,
      classEntity.id,
    );

    return this.serializeClassDetail(joinedClass);
  }

  async listClassMembers(currentUser: AuthenticatedUser, classId: number) {
    this.ensureCanManageClasses(currentUser);
    const classEntity = await this.findManageableClassOrThrow(
      currentUser,
      classId,
    );
    return this.serializeClassMembers(classEntity);
  }

  async removeClassMember(
    currentUser: AuthenticatedUser,
    classId: number,
    studentId: number,
  ) {
    this.ensureCanManageClasses(currentUser);
    const classEntity = await this.findManageableClassOrThrow(
      currentUser,
      classId,
    );
    const classMember = await this.classesRepository.findMember(
      classEntity.id,
      studentId,
    );

    if (!classMember) {
      throw new NotFoundException('Class member not found');
    }

    await this.classesRepository.removeMember(classMember);

    return {
      message: 'Student removed from class successfully',
    };
  }

  serializeClass(classEntity: RawClassEntity) {
    return {
      id: classEntity.id,
      className: classEntity.className,
      classCode: classEntity.classCode,
      teacherId: classEntity.teacherId,
      description: classEntity.description,
      createdAt: classEntity.createdAt,
      teacher: {
        id: classEntity.teacher.id,
        fullName: classEntity.teacher.fullName,
        userCode: classEntity.teacher.userCode,
        email: classEntity.teacher.email,
      },
      schedules: [...classEntity.schedules]
        .sort((left, right) => this.compareSchedules(left, right))
        .map((schedule) => this.serializeSchedule(schedule)),
      memberCount: classEntity.classMembers.length,
    };
  }

  serializeClassDetail(classEntity: RawClassEntity) {
    return {
      ...this.serializeClass(classEntity),
      members: this.serializeClassMembers(classEntity),
    };
  }

  private serializeClassMembers(classEntity: RawClassEntity) {
    return [...classEntity.classMembers]
      .sort((left, right) => left.joinedAt.getTime() - right.joinedAt.getTime())
      .map((classMember) => ({
        id: classMember.id,
        studentId: classMember.studentId,
        fullName: classMember.student.fullName,
        userCode: classMember.student.userCode,
        email: classMember.student.email,
        joinedAt: classMember.joinedAt,
      }));
  }

  private serializeSchedule(schedule: RawClassScheduleEntity) {
    return {
      id: schedule.id,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      room: schedule.room,
      createdAt: schedule.createdAt,
    };
  }

  private async findAccessibleClassOrThrow(
    currentUser: AuthenticatedUser,
    classId: number,
  ): Promise<RawClassEntity> {
    const classEntity = await this.findClassByIdOrThrow(classId);

    if (currentUser.role === 'admin') {
      return classEntity;
    }

    if (currentUser.role === 'teacher') {
      if (classEntity.teacherId !== currentUser.id) {
        throw new ForbiddenException('You do not have access to this class');
      }

      return classEntity;
    }

    const isMember = classEntity.classMembers.some(
      (classMember) => classMember.studentId === currentUser.id,
    );

    if (!isMember) {
      throw new ForbiddenException('You do not have access to this class');
    }

    return classEntity;
  }

  private async findManageableClassOrThrow(
    currentUser: AuthenticatedUser,
    classId: number,
  ): Promise<RawClassEntity> {
    const classEntity = await this.findClassByIdOrThrow(classId);

    if (currentUser.role === 'admin') {
      return classEntity;
    }

    if (classEntity.teacherId !== currentUser.id) {
      throw new ForbiddenException('You can only manage your own classes');
    }

    return classEntity;
  }

  private async findClassByIdOrThrow(classId: number): Promise<RawClassEntity> {
    const classEntity = await this.classesRepository.findById(classId);

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    return classEntity;
  }

  private async resolveTeacherIdForCreate(
    currentUser: AuthenticatedUser,
    requestedTeacherId?: number,
  ): Promise<number> {
    if (currentUser.role === 'teacher') {
      if (
        requestedTeacherId !== undefined &&
        requestedTeacherId !== currentUser.id
      ) {
        throw new ForbiddenException(
          'Teachers can only create classes for themselves',
        );
      }

      return this.ensureTeacherExists(currentUser.id);
    }

    if (requestedTeacherId === undefined) {
      throw new BadRequestException(
        'teacherId is required when admin creates a class',
      );
    }

    return this.ensureTeacherExists(requestedTeacherId);
  }

  private async resolveTeacherIdForUpdate(
    currentUser: AuthenticatedUser,
    currentTeacherId: number,
    requestedTeacherId: number,
  ): Promise<number> {
    if (
      currentUser.role === 'teacher' &&
      requestedTeacherId !== currentUser.id
    ) {
      throw new ForbiddenException(
        'Teachers cannot transfer classes to another teacher',
      );
    }

    if (requestedTeacherId === currentTeacherId) {
      return currentTeacherId;
    }

    return this.ensureTeacherExists(requestedTeacherId);
  }

  private async ensureTeacherExists(userId: number): Promise<number> {
    const user = await this.classesRepository.findUserById(userId);

    if (!user) {
      throw new BadRequestException('Teacher does not exist');
    }

    if (user.role?.name !== 'teacher') {
      throw new BadRequestException('Selected user is not a teacher');
    }

    return user.id;
  }

  private async ensureClassCodeAvailable(
    classCode: string,
    excludeClassId?: number,
  ): Promise<void> {
    const existingClass =
      await this.classesRepository.findByClassCode(classCode);

    if (existingClass && existingClass.id !== excludeClassId) {
      throw new ConflictException('Class code is already in use');
    }
  }

  private async resolveAvailableClassCode(
    requestedClassCode?: string,
  ): Promise<string> {
    if (requestedClassCode) {
      const normalizedClassCode = this.normalizeClassCode(requestedClassCode);
      await this.ensureClassCodeAvailable(normalizedClassCode);
      return normalizedClassCode;
    }

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const generatedClassCode = `CLS-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`;
      const existingClass =
        await this.classesRepository.findByClassCode(generatedClassCode);

      if (!existingClass) {
        return generatedClassCode;
      }
    }

    throw new ConflictException('Unable to generate a unique class code');
  }

  private normalizeSchedules(
    schedules: UpdateClassDto['schedules'] | CreateClassDto['schedules'],
  ): UpsertClassScheduleRecordInput[] {
    const normalizedSchedules = (schedules ?? []).map((schedule) => ({
      dayOfWeek: schedule.dayOfWeek,
      startTime: this.normalizeTime(schedule.startTime, 'startTime'),
      endTime: this.normalizeTime(schedule.endTime, 'endTime'),
      room: this.normalizeRequiredText(schedule.room, 'Room'),
    }));

    for (const schedule of normalizedSchedules) {
      if (
        this.toTimeValue(schedule.startTime) >=
        this.toTimeValue(schedule.endTime)
      ) {
        throw new BadRequestException(
          'Schedule startTime must be earlier than endTime',
        );
      }
    }

    return normalizedSchedules;
  }

  private compareSchedules(
    left: RawClassScheduleEntity,
    right: RawClassScheduleEntity,
  ): number {
    return (
      left.dayOfWeek - right.dayOfWeek ||
      this.toTimeValue(left.startTime) - this.toTimeValue(right.startTime) ||
      this.toTimeValue(left.endTime) - this.toTimeValue(right.endTime)
    );
  }

  private toTimeValue(time: string): number {
    const [hours, minutes, seconds = '0'] = time.split(':');
    return Number(hours) * 60 * 60 + Number(minutes) * 60 + Number(seconds);
  }

  private normalizeClassCode(classCode: string): string {
    const normalizedClassCode = classCode.trim().toUpperCase();

    if (!normalizedClassCode) {
      throw new BadRequestException('Class code cannot be empty');
    }

    return normalizedClassCode;
  }

  private normalizeTime(value: string, fieldName: string): string {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      throw new BadRequestException(`${fieldName} cannot be empty`);
    }

    return normalizedValue;
  }

  private normalizeRequiredText(value: string, fieldName: string): string {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      throw new BadRequestException(`${fieldName} cannot be empty`);
    }

    return normalizedValue;
  }

  private normalizeNullableText(value?: string | null): string | null {
    if (value == null) {
      return null;
    }

    const normalizedValue = value.trim();
    return normalizedValue.length ? normalizedValue : null;
  }

  private ensureCanManageClasses(currentUser: AuthenticatedUser): void {
    if (currentUser.role === 'student') {
      throw new ForbiddenException(
        'Students are not allowed to manage classes',
      );
    }
  }
}
