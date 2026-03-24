export interface PendingAttendanceReview {
  recordId: number;
  sessionId: number;
  studentId: number;
  confidenceScore: number | null;
  recordedAt: Date;
}
