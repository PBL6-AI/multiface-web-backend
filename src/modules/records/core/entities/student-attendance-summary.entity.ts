export interface StudentAttendanceSummary {
  studentId: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  pending: number;
  attendanceRate: number;
}
