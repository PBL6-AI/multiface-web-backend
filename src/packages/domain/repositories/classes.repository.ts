import type {
  RawClassEntity,
  RawClassMemberEntity,
  RawUserEntity,
} from '../entities';

export type UpsertClassScheduleRecordInput = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
};

export type CreateClassRecordInput = {
  className: string;
  classCode: string;
  teacherId: number;
  description: string | null;
  schedules: UpsertClassScheduleRecordInput[];
};

export interface ClassesRepository {
  listAll(): Promise<RawClassEntity[]>;
  listByTeacherId(teacherId: number): Promise<RawClassEntity[]>;
  listByStudentId(studentId: number): Promise<RawClassEntity[]>;
  findById(classId: number): Promise<RawClassEntity | null>;
  findByClassCode(classCode: string): Promise<RawClassEntity | null>;
  createClass(input: CreateClassRecordInput): Promise<RawClassEntity>;
  saveClass(
    classEntity: RawClassEntity,
    schedules?: UpsertClassScheduleRecordInput[],
  ): Promise<RawClassEntity>;
  deleteClass(classEntity: RawClassEntity): Promise<void>;
  findUserById(userId: number): Promise<RawUserEntity | null>;
  findMember(
    classId: number,
    studentId: number,
  ): Promise<RawClassMemberEntity | null>;
  addMember(classId: number, studentId: number): Promise<RawClassMemberEntity>;
  removeMember(classMember: RawClassMemberEntity): Promise<void>;
}
