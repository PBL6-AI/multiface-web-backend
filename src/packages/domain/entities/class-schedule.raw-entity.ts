import type { RawClassEntity } from './class.raw-entity';

export interface RawClassScheduleEntity {
  id: number;
  classId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  createdAt: Date;
  classEntity: RawClassEntity;
}
