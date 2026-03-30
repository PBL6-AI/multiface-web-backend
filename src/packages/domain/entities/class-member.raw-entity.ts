import type { RawClassEntity } from './class.raw-entity';
import type { RawUserEntity } from './user.raw-entity';

export interface RawClassMemberEntity {
  id: number;
  classId: number;
  studentId: number;
  joinedAt: Date;
  classEntity: RawClassEntity;
  student: RawUserEntity;
}
