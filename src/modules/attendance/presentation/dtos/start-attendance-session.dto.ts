import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { AttendanceType } from '../../../../common/domain/enums';

export class StartAttendanceSessionDto {
  @IsNumber()
  classId: number;

  @IsNumber()
  createdById: number;

  @IsOptional()
  @IsEnum(AttendanceType)
  attendanceType?: AttendanceType;

  @IsOptional()
  @IsNumber()
  confidenceThreshold?: number;
}
