import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  RawRoleEntity,
  RawUserEntity,
  UsersRepository,
} from '../../../packages/domain';
import { REPOSITORY_TOKENS } from '../../../common/constants';
import { hashSecret } from '../../../common/utils';
import {
  DEFAULT_STUDENT_ROLE,
  SYSTEM_ROLES,
  SystemRole,
} from '../../auth/auth.constants';
import { RegisterDto } from '../../auth/dtos';
import {
  CreateUserDto,
  ListUsersQueryDto,
  UpdateProfileDto,
  UpdateUserDto,
} from '../dtos';

type AcademicAssignment = {
  departmentId: number | null;
  specializationId: number | null;
};

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    @Inject(REPOSITORY_TOKENS.USERS)
    private readonly usersRepository: UsersRepository,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultRoles();
  }

  async createSelfRegisteredUser(
    registerDto: RegisterDto,
  ): Promise<RawUserEntity> {
    return this.createUser({
      fullName: registerDto.fullName,
      userCode: registerDto.userCode,
      email: registerDto.email,
      password: registerDto.password,
      role: DEFAULT_STUDENT_ROLE,
      phone: registerDto.phone,
      departmentId: registerDto.departmentId,
      specializationId: registerDto.specializationId,
    });
  }

  async createUserByAdmin(
    createUserDto: CreateUserDto,
  ): Promise<RawUserEntity> {
    return this.createUser(createUserDto);
  }

  async listUsers(query: ListUsersQueryDto = {}) {
    const users = await this.usersRepository.listUsers(
      query.role?.toLowerCase(),
    );

    return users.map((user) => this.serializeUser(user));
  }

  async getProfile(userId: number) {
    const user = await this.findByIdOrThrow(userId);
    return this.serializeUser(user);
  }

  async getUserById(userId: number) {
    return this.getProfile(userId);
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.findByIdOrThrow(userId);
    const updatedUser = await this.applyUserUpdates(user, updateProfileDto);

    return this.serializeUser(updatedUser);
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.findByIdOrThrow(userId);
    const updatedUser = await this.applyUserUpdates(user, updateUserDto);

    if (updateUserDto.role) {
      const role = await this.resolveRole(updateUserDto.role);
      updatedUser.roleId = role.id;
      updatedUser.role = role;
    }

    const savedUser = await this.usersRepository.save(updatedUser);
    return this.serializeUser(savedUser);
  }

  async findForAuthentication(userCode: string): Promise<RawUserEntity | null> {
    return this.usersRepository.findByUserCode(
      this.normalizeUserCode(userCode),
    );
  }

  async findForAuthenticationById(userId: number): Promise<RawUserEntity> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByIdOrThrow(userId: number): Promise<RawUserEntity> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async saveUser(user: RawUserEntity): Promise<RawUserEntity> {
    return this.usersRepository.save(user);
  }

  serializeUser(user: RawUserEntity) {
    return {
      id: user.id,
      fullName: user.fullName,
      userCode: user.userCode,
      email: user.email,
      phone: user.phone,
      avatarFileId: user.avatarFileId,
      avatarFile: user.avatarFile
        ? {
            id: user.avatarFile.id,
            fileKey: user.avatarFile.fileKey,
            filename: user.avatarFile.filename,
            category: user.avatarFile.category,
            storageProvider: user.avatarFile.storageProvider,
            size: user.avatarFile.size,
            bucket: this.configService.get<string>('storage.bucket') ?? '',
          }
        : null,
      avatarUrl: user.avatarFile
        ? this.buildStoredObjectUrl(user.avatarFile.fileKey)
        : null,
      departmentId: user.departmentId,
      departmentName: user.department?.name ?? null,
      specializationId: user.specializationId,
      specializationName: user.specialization?.name ?? null,
      roleId: user.roleId,
      role: user.role?.name.toLowerCase() ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private buildStoredObjectUrl(fileKey: string): string {
    const bucket = this.configService.get<string>('storage.bucket') ?? '';
    const region = this.configService.get<string>('storage.region') ?? '';

    if (!bucket || !fileKey) {
      return '';
    }

    const normalizedKey = fileKey
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');

    if (region) {
      return `https://${bucket}.s3.${region}.amazonaws.com/${normalizedKey}`;
    }

    return `https://${bucket}.s3.amazonaws.com/${normalizedKey}`;
  }

  private async createUser(input: {
    fullName: string;
    userCode: string;
    email: string;
    password: string;
    role: SystemRole;
    phone?: string | null;
    departmentId?: number | null;
    specializationId?: number | null;
    avatarFileId?: number | null;
  }): Promise<RawUserEntity> {
    const normalizedUserCode = this.normalizeUserCode(input.userCode);
    const normalizedEmail = this.normalizeEmail(input.email);
    await this.ensureUserCodeAvailable(normalizedUserCode);
    await this.ensureEmailAvailable(normalizedEmail);

    const role = await this.resolveRole(input.role);
    const academicAssignment = await this.resolveAcademicAssignment(
      input.departmentId ?? null,
      input.specializationId ?? null,
    );

    if (input.avatarFileId !== undefined) {
      await this.ensureAvatarExists(input.avatarFileId);
    }

    return this.usersRepository.create({
      fullName: this.normalizeRequiredText(input.fullName, 'Full name'),
      userCode: normalizedUserCode,
      email: normalizedEmail,
      passwordHash: await hashSecret(input.password),
      roleId: role.id,
      phone: this.normalizeNullableText(input.phone),
      departmentId: academicAssignment.departmentId,
      specializationId: academicAssignment.specializationId,
      avatarFileId: input.avatarFileId ?? null,
    });
  }

  private async applyUserUpdates(
    user: RawUserEntity,
    updateDto: UpdateProfileDto | UpdateUserDto,
  ): Promise<RawUserEntity> {
    if ('userCode' in updateDto && updateDto.userCode !== undefined) {
      const normalizedUserCode = this.normalizeUserCode(updateDto.userCode);

      if (normalizedUserCode !== user.userCode) {
        await this.ensureUserCodeAvailable(normalizedUserCode, user.id);
        user.userCode = normalizedUserCode;
      }
    }

    if (updateDto.email !== undefined) {
      const normalizedEmail = this.normalizeEmail(updateDto.email);

      if (normalizedEmail !== user.email) {
        await this.ensureEmailAvailable(normalizedEmail, user.id);
        user.email = normalizedEmail;
      }
    }

    if (updateDto.fullName !== undefined) {
      user.fullName = this.normalizeRequiredText(
        updateDto.fullName,
        'Full name',
      );
    }

    if (updateDto.phone !== undefined) {
      user.phone = this.normalizeNullableText(updateDto.phone);
    }

    if (updateDto.avatarFileId !== undefined) {
      await this.ensureAvatarExists(updateDto.avatarFileId);
      user.avatarFileId = updateDto.avatarFileId ?? null;
    }

    if (
      updateDto.departmentId !== undefined ||
      updateDto.specializationId !== undefined
    ) {
      if (
        updateDto.departmentId === null &&
        updateDto.specializationId === undefined
      ) {
        if (user.specializationId !== null) {
          throw new BadRequestException(
            'Clear specialization before removing the department',
          );
        }

        user.departmentId = null;
      } else {
        const academicAssignment = await this.resolveAcademicAssignment(
          updateDto.departmentId ?? user.departmentId,
          updateDto.specializationId ?? user.specializationId,
        );

        if (updateDto.specializationId === null) {
          academicAssignment.specializationId = null;
        }

        if (
          updateDto.departmentId === null &&
          updateDto.specializationId === null
        ) {
          academicAssignment.departmentId = null;
          academicAssignment.specializationId = null;
        }

        user.departmentId = academicAssignment.departmentId;
        user.specializationId = academicAssignment.specializationId;
      }
    }

    return this.usersRepository.save(user);
  }

  private async ensureDefaultRoles() {
    const existingRoles = await this.usersRepository.listRoles();
    const existingRoleNames = new Set(
      existingRoles.map((role) => role.name.toLowerCase()),
    );

    const missingRoles = SYSTEM_ROLES.filter(
      (role) => !existingRoleNames.has(role),
    );

    if (!missingRoles.length) {
      return;
    }

    for (const role of missingRoles) {
      await this.usersRepository.createRole({
        name: role,
        description: `${role} role`,
      });
    }
  }

  private async resolveRole(roleName: string): Promise<RawRoleEntity> {
    const normalizedRoleName = roleName.toLowerCase();
    const role = await this.usersRepository.findRoleByName(normalizedRoleName);

    if (!role) {
      throw new BadRequestException(`Role "${roleName}" is not supported`);
    }

    return role;
  }

  private async resolveAcademicAssignment(
    departmentId: number | null,
    specializationId: number | null,
  ): Promise<AcademicAssignment> {
    if (departmentId === null && specializationId === null) {
      return { departmentId: null, specializationId: null };
    }

    let resolvedDepartmentId = departmentId;
    const resolvedSpecializationId = specializationId;

    if (resolvedDepartmentId !== null) {
      const department =
        await this.usersRepository.findDepartmentById(resolvedDepartmentId);

      if (!department) {
        throw new BadRequestException('Department does not exist');
      }
    }

    if (resolvedSpecializationId !== null) {
      const specialization = await this.usersRepository.findSpecializationById(
        resolvedSpecializationId,
      );

      if (!specialization) {
        throw new BadRequestException('Specialization does not exist');
      }

      if (
        resolvedDepartmentId !== null &&
        specialization.departmentId !== resolvedDepartmentId
      ) {
        throw new BadRequestException(
          'Specialization does not belong to the selected department',
        );
      }

      resolvedDepartmentId = specialization.departmentId;
    }

    return {
      departmentId: resolvedDepartmentId,
      specializationId: resolvedSpecializationId,
    };
  }

  private async ensureAvatarExists(
    avatarFileId: number | null | undefined,
  ): Promise<void> {
    if (avatarFileId == null) {
      return;
    }

    const avatar = await this.usersRepository.findFileById(avatarFileId);

    if (!avatar) {
      throw new BadRequestException('Avatar file does not exist');
    }
  }

  private async ensureEmailAvailable(
    email: string,
    excludeUserId?: number,
  ): Promise<void> {
    const existingUser = await this.usersRepository.findByEmail(email);

    if (existingUser && existingUser.id !== excludeUserId) {
      throw new ConflictException('Email is already in use');
    }
  }

  private async ensureUserCodeAvailable(
    userCode: string,
    excludeUserId?: number,
  ): Promise<void> {
    const existingUser = await this.usersRepository.findByUserCode(userCode);

    if (existingUser && existingUser.id !== excludeUserId) {
      throw new ConflictException('User code is already in use');
    }
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private normalizeUserCode(userCode: string): string {
    const normalizedUserCode = userCode.trim().toUpperCase();

    if (!normalizedUserCode) {
      throw new BadRequestException('User code cannot be empty');
    }

    return normalizedUserCode;
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
}
