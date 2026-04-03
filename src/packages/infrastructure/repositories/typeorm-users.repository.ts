import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import type {
  CreateRoleRecordInput,
  CreateUserRecordInput,
  UsersRepository,
} from '../../domain/repositories';
import { DepartmentEntity } from '../entities/department.entity';
import { FileEntity } from '../entities/file.entity';
import { RoleEntity } from '../entities/role.entity';
import { SpecializationEntity } from '../entities/specialization.entity';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class TypeOrmUsersRepository implements UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly rolesRepository: Repository<RoleEntity>,
    @InjectRepository(DepartmentEntity)
    private readonly departmentsRepository: Repository<DepartmentEntity>,
    @InjectRepository(SpecializationEntity)
    private readonly specializationsRepository: Repository<SpecializationEntity>,
    @InjectRepository(FileEntity)
    private readonly filesRepository: Repository<FileEntity>,
  ) {}

  async listUsers(roleName?: string): Promise<UserEntity[]> {
    const where = roleName
      ? {
          role: {
            name: roleName,
          },
        }
      : undefined;

    return this.usersRepository.find({
      where,
      relations: this.userRelations,
      order: { createdAt: 'DESC' },
    });
  }

  async findById(userId: number): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { id: userId },
      relations: this.userRelations,
    });
  }

  async findByUserCode(userCode: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { userCode: ILike(userCode) },
      relations: this.userRelations,
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: this.userRelations,
    });
  }

  async create(input: CreateUserRecordInput): Promise<UserEntity> {
    const savedUser = await this.usersRepository.save(
      this.usersRepository.create(input),
    );

    const user = await this.findById(savedUser.id);

    if (!user) {
      throw new Error('User was created but could not be reloaded');
    }

    return user;
  }

  async save(user: UserEntity): Promise<UserEntity> {
    const savedUser = await this.usersRepository.save(user);
    const reloadedUser = await this.findById(savedUser.id);

    if (!reloadedUser) {
      throw new Error('User was saved but could not be reloaded');
    }

    return reloadedUser;
  }

  async listRoles(): Promise<RoleEntity[]> {
    return this.rolesRepository.find();
  }

  async createRole(input: CreateRoleRecordInput): Promise<RoleEntity> {
    return this.rolesRepository.save(this.rolesRepository.create(input));
  }

  async findRoleByName(roleName: string): Promise<RoleEntity | null> {
    return this.rolesRepository.findOne({
      where: { name: roleName },
    });
  }

  async findDepartmentById(
    departmentId: number,
  ): Promise<DepartmentEntity | null> {
    return this.departmentsRepository.findOne({
      where: { id: departmentId },
    });
  }

  async findSpecializationById(
    specializationId: number,
  ): Promise<SpecializationEntity | null> {
    return this.specializationsRepository.findOne({
      where: { id: specializationId },
    });
  }

  async findFileById(fileId: number): Promise<FileEntity | null> {
    return this.filesRepository.findOne({
      where: { id: fileId },
    });
  }

  private readonly userRelations = {
    role: true,
    department: true,
    specialization: true,
  } as const;
}
