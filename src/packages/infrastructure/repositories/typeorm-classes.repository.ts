import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import type {
  ClassesRepository,
  CreateClassRecordInput,
  UpsertClassScheduleRecordInput,
} from '../../domain/repositories';
import { ClassEntity } from '../entities/class.entity';
import { ClassMemberEntity } from '../entities/class-member.entity';
import { ClassScheduleEntity } from '../entities/class-schedule.entity';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class TypeOrmClassesRepository implements ClassesRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(ClassEntity)
    private readonly classesRepository: Repository<ClassEntity>,
    @InjectRepository(ClassMemberEntity)
    private readonly classMembersRepository: Repository<ClassMemberEntity>,
    @InjectRepository(ClassScheduleEntity)
    private readonly classSchedulesRepository: Repository<ClassScheduleEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async listAll(): Promise<ClassEntity[]> {
    return this.classesRepository.find({
      relations: this.classRelations,
      order: { createdAt: 'DESC' },
    });
  }

  async listByTeacherId(teacherId: number): Promise<ClassEntity[]> {
    return this.classesRepository.find({
      where: { teacherId },
      relations: this.classRelations,
      order: { createdAt: 'DESC' },
    });
  }

  async listByStudentId(studentId: number): Promise<ClassEntity[]> {
    return this.classesRepository.find({
      where: {
        classMembers: {
          studentId,
        },
      },
      relations: this.classRelations,
      order: { createdAt: 'DESC' },
    });
  }

  async findById(classId: number): Promise<ClassEntity | null> {
    return this.classesRepository.findOne({
      where: { id: classId },
      relations: this.classRelations,
    });
  }

  async findByClassCode(classCode: string): Promise<ClassEntity | null> {
    return this.classesRepository.findOne({
      where: {
        classCode: ILike(classCode),
      },
      relations: this.classRelations,
    });
  }

  async createClass(input: CreateClassRecordInput): Promise<ClassEntity> {
    const savedClassId = await this.dataSource.transaction(async (manager) => {
      const classRepository = manager.getRepository(ClassEntity);
      const scheduleRepository = manager.getRepository(ClassScheduleEntity);
      const createdClass = await classRepository.save(
        classRepository.create({
          className: input.className,
          classCode: input.classCode,
          teacherId: input.teacherId,
          description: input.description,
        }),
      );

      if (input.schedules.length) {
        await scheduleRepository.save(
          input.schedules.map((schedule) =>
            scheduleRepository.create({
              classId: createdClass.id,
              ...schedule,
            }),
          ),
        );
      }

      return createdClass.id;
    });

    const createdClass = await this.findById(savedClassId);

    if (!createdClass) {
      throw new Error('Class was created but could not be reloaded');
    }

    return createdClass;
  }

  async saveClass(
    classEntity: ClassEntity,
    schedules?: UpsertClassScheduleRecordInput[],
  ): Promise<ClassEntity> {
    const savedClassId = await this.dataSource.transaction(async (manager) => {
      const classRepository = manager.getRepository(ClassEntity);
      const scheduleRepository = manager.getRepository(ClassScheduleEntity);
      const savedClass = await classRepository.save(classEntity);

      if (schedules !== undefined) {
        await scheduleRepository.delete({ classId: savedClass.id });

        if (schedules.length) {
          await scheduleRepository.save(
            schedules.map((schedule) =>
              scheduleRepository.create({
                classId: savedClass.id,
                ...schedule,
              }),
            ),
          );
        }
      }

      return savedClass.id;
    });

    const reloadedClass = await this.findById(savedClassId);

    if (!reloadedClass) {
      throw new Error('Class was saved but could not be reloaded');
    }

    return reloadedClass;
  }

  async deleteClass(classEntity: ClassEntity): Promise<void> {
    await this.classesRepository.delete({ id: classEntity.id });
  }

  async findUserById(userId: number): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { id: userId },
      relations: {
        role: true,
      },
    });
  }

  async findMember(
    classId: number,
    studentId: number,
  ): Promise<ClassMemberEntity | null> {
    return this.classMembersRepository.findOne({
      where: { classId, studentId },
      relations: {
        classEntity: true,
        student: {
          role: true,
        },
      },
    });
  }

  async addMember(
    classId: number,
    studentId: number,
  ): Promise<ClassMemberEntity> {
    const savedClassMember = await this.classMembersRepository.save(
      this.classMembersRepository.create({
        classId,
        studentId,
      }),
    );

    const classMember = await this.findMember(
      savedClassMember.classId,
      savedClassMember.studentId,
    );

    if (!classMember) {
      throw new Error('Class member was created but could not be reloaded');
    }

    return classMember;
  }

  async removeMember(classMember: ClassMemberEntity): Promise<void> {
    await this.classMembersRepository.delete({ id: classMember.id });
  }

  private readonly classRelations = {
    teacher: {
      role: true,
    },
    schedules: true,
    classMembers: {
      student: {
        role: true,
      },
    },
  } as const;
}
