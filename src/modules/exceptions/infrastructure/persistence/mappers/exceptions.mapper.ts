import {
  AttendanceRecordEntity,
  UnknownFaceEntity,
} from '../../../../../infrastructure/persistence/typeorm/entities';
import type {
  PendingAttendanceReview,
  UnknownFace,
} from '../../../core/entities';

export class ExceptionsMapper {
  static toPendingAttendanceReview(
    record: AttendanceRecordEntity,
  ): PendingAttendanceReview {
    return {
      recordId: record.id,
      sessionId: record.sessionId,
      studentId: record.studentId,
      confidenceScore: record.confidenceScore,
      recordedAt: record.recordedAt,
    };
  }

  static toUnknownFace(unknownFace: UnknownFaceEntity): UnknownFace {
    return {
      id: unknownFace.id,
      sessionId: unknownFace.sessionId,
      frameId: unknownFace.frameId,
      imageFileId: unknownFace.imageFileId,
      detectedAt: unknownFace.detectedAt,
    };
  }
}
