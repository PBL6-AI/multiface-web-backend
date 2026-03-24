import type { SessionLiveData } from '../entities';

export interface IRealTimeRepository {
  getSessionLiveData(sessionId: number): Promise<SessionLiveData>;
}
