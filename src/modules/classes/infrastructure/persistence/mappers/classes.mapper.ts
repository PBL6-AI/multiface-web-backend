import {
  ClassEntity,
  ClassMemberEntity,
} from '../../../../../infrastructure/persistence/typeorm/entities';
import type { ClassMemberSummary, ClassSummary } from '../../../core/entities';

export class ClassesMapper {
  static toClassSummary(classEntity: ClassEntity): ClassSummary {
    return {
      id: classEntity.id,
      className: classEntity.className,
      classCode: classEntity.classCode,
      teacherId: classEntity.teacherId,
      description: classEntity.description,
    };
  }

  static toClassMemberSummary(member: ClassMemberEntity): ClassMemberSummary {
    return {
      userId: member.student.id,
      fullName: member.student.fullName,
      email: member.student.email,
      joinedAt: member.joinedAt,
    };
  }
}
