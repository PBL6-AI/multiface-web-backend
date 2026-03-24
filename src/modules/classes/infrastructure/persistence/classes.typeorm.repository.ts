import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ClassEntity,
  ClassMemberEntity,
} from '../../../../infrastructure/persistence/typeorm/entities';
import type { ClassMemberSummary, ClassSummary } from '../../core/entities';
import { IClassesRepository } from '../../core/interfaces/classes.repository.interface';
import { ClassesMapper } from './mappers/classes.mapper';

@Injectable()
export class ClassesTypeOrmRepository implements IClassesRepository {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepository: Repository<ClassEntity>,
    @InjectRepository(ClassMemberEntity)
    private readonly classMemberRepository: Repository<ClassMemberEntity>,
  ) {}

  async createClass(data: {
    className: string;
    classCode: string;
    teacherId: number;
    description?: string;
  }): Promise<ClassSummary> {
    const classEntity = await this.classRepository.save(
      this.classRepository.create({
        className: data.className,
        classCode: data.classCode,
        teacherId: data.teacherId,
        description: data.description ?? null,
      }),
    );

    return ClassesMapper.toClassSummary(classEntity);
  }

  async findClassByCode(classCode: string): Promise<ClassSummary | null> {
    const classEntity = await this.classRepository.findOne({
      where: { classCode },
    });

    return classEntity ? ClassesMapper.toClassSummary(classEntity) : null;
  }

  async addStudentToClass(classId: number, studentId: number): Promise<void> {
    const existing = await this.classMemberRepository.findOne({
      where: { classId, studentId },
    });

    if (existing) {
      return;
    }

    await this.classMemberRepository.save(
      this.classMemberRepository.create({
        classId,
        studentId,
      }),
    );
  }

  async listMembers(classId: number): Promise<ClassMemberSummary[]> {
    const members = await this.classMemberRepository.find({
      where: { classId },
      relations: ['student'],
      order: { joinedAt: 'DESC' },
    });

    return members
      .filter((member) => Boolean(member.student))
      .map((member) => ClassesMapper.toClassMemberSummary(member));
  }
}
