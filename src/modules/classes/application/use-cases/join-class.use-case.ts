import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../../common/constants/repository.tokens';
import type { ClassMemberSummary } from '../../core/entities';
import type { IClassesRepository } from '../../core/interfaces/classes.repository.interface';

interface JoinClassInput {
  classCode: string;
  studentId: number;
}

@Injectable()
export class JoinClassUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.CLASSES)
    private readonly classesRepository: IClassesRepository,
  ) {}

  async execute(input: JoinClassInput): Promise<ClassMemberSummary[]> {
    const classEntity = await this.classesRepository.findClassByCode(
      input.classCode,
    );

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    if (classEntity.teacherId === input.studentId) {
      throw new BadRequestException('Teacher cannot join class as student');
    }

    await this.classesRepository.addStudentToClass(
      classEntity.id,
      input.studentId,
    );
    return this.classesRepository.listMembers(classEntity.id);
  }
}
