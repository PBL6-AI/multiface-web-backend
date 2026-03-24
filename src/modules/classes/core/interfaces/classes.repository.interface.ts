import type { ClassMemberSummary, ClassSummary } from '../entities';

export interface IClassesRepository {
  createClass(data: {
    className: string;
    classCode: string;
    teacherId: number;
    description?: string;
  }): Promise<ClassSummary>;
  findClassByCode(classCode: string): Promise<ClassSummary | null>;
  addStudentToClass(classId: number, studentId: number): Promise<void>;
  listMembers(classId: number): Promise<ClassMemberSummary[]>;
}
