export interface SessionLiveData {
  sessionId: number;
  totalRecognized: number;
  presentStudentIds: number[];
  lastUpdatedAt: Date | null;
}
