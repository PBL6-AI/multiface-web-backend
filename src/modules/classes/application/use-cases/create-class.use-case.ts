import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../../common/constants/repository.tokens';
import type { ClassSummary } from '../../core/entities';
import type { IClassesRepository } from '../../core/interfaces/classes.repository.interface';

interface CreateClassInput {
  className: string;
  teacherId: number;
  classCode?: string;
  description?: string;
}

@Injectable()
export class CreateClassUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.CLASSES)
    private readonly classesRepository: IClassesRepository,
  ) {}

  async execute(input: CreateClassInput): Promise<ClassSummary> {
    const classCode = input.classCode ?? this.generateClassCode();
    const existing = await this.classesRepository.findClassByCode(classCode);

    if (existing) {
      throw new BadRequestException('Class code already exists');
    }

    return this.classesRepository.createClass({
      className: input.className,
      classCode,
      teacherId: input.teacherId,
      description: input.description,
    });
  }

  private generateClassCode(): string {
    return `CLS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }
}
