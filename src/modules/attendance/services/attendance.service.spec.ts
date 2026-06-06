import { AttendanceSessionStatus } from '../../../common/domain/enums';
import type {
  AttendanceRepository,
  FacesRepository,
  RawAttendanceSessionEntity,
} from '../../../packages/domain';
import type { FaceAiProvider } from '../../ai-integration/interfaces';
import type { EdgeDevicesService } from '../../edge-devices';
import { AttendanceService } from './attendance.service';

describe('AttendanceService.verifyAttendance', () => {
  const embedding = [0.1, 0.2, 0.3];

  function buildSession() {
    return {
      id: 91,
      status: AttendanceSessionStatus.ACTIVE,
      cameraId: 'CAM_01',
      sourceDeviceId: 'pi-room-a-01',
      confidenceThreshold: 0.8,
      classEntity: {
        classMembers: [
          {
            studentId: 1,
            student: {
              fullName: 'Student One',
            },
          },
          {
            studentId: 2,
            student: {
              fullName: 'Student Two',
            },
          },
        ],
      },
    } as unknown as RawAttendanceSessionEntity;
  }

  function buildService(options?: {
    prototypeCandidates?: Array<{ studentId: number; similarity: number }>;
    closestMatches?: Array<{
      studentId: number;
      embeddingId: number;
      similarity: number;
    }>;
  }) {
    const session = buildSession();
    const attendanceRepository = {
      findSessionById: jest.fn().mockResolvedValue(session),
      createRecognitionEvent: jest.fn().mockResolvedValue({ id: 501 }),
      findAttendanceRecord: jest.fn().mockResolvedValue(null),
      createAttendanceRecord: jest.fn().mockResolvedValue({ id: 701 }),
    };
    const facesRepository = {
      findClosestPrototypeCandidates: jest
        .fn()
        .mockResolvedValue(
          options?.prototypeCandidates ?? [{ studentId: 1, similarity: 0.9 }],
        ),
      findClosestEnrollmentEmbedding: jest
        .fn()
        .mockResolvedValue(
          options?.closestMatches ?? [
            { studentId: 1, embeddingId: 301, similarity: 0.86 },
          ],
        ),
    };

    const service = new AttendanceService(
      attendanceRepository as unknown as AttendanceRepository,
      facesRepository as unknown as FacesRepository,
      {} as unknown as FaceAiProvider,
      {} as unknown as EdgeDevicesService,
    );

    return { service, attendanceRepository, facesRepository };
  }

  it('accepts a high similarity match even when detector confidence is below threshold', async () => {
    const { service, attendanceRepository } = buildService();

    const response = await service.verifyAttendance({
      sessionId: 91,
      sourceDeviceId: 'pi-room-a-01',
      embedding,
      cameraId: 'CAM_01',
      trackId: 42,
      detectionScore: 0.72,
      timestamp: '2026-04-29T12:07:37.959Z',
    });

    expect(response.status).toBe('MATCH');
    expect(response.similarity).toBe(0.86);
    expect(attendanceRepository.createRecognitionEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        confidenceScore: 0.86,
        similarityScore: 0.86,
      }),
    );
  });

  it('rejects a match below the session similarity threshold', async () => {
    const { service, attendanceRepository } = buildService({
      closestMatches: [{ studentId: 1, embeddingId: 301, similarity: 0.75 }],
    });

    const response = await service.verifyAttendance({
      sessionId: 91,
      sourceDeviceId: 'pi-room-a-01',
      embedding,
      cameraId: 'CAM_01',
      trackId: 42,
      detectionScore: 0.99,
      timestamp: '2026-04-29T12:07:37.959Z',
    });

    expect(response.status).toBe('NO_MATCH');
    expect(response.similarity).toBe(0.75);
    expect(attendanceRepository.createRecognitionEvent).not.toHaveBeenCalled();
  });

  it('limits prototype search to students in the attendance session', async () => {
    const { service, facesRepository } = buildService();

    await service.verifyAttendance({
      sessionId: 91,
      sourceDeviceId: 'pi-room-a-01',
      embedding,
      cameraId: 'CAM_01',
      trackId: 42,
      detectionScore: 0.9,
      timestamp: '2026-04-29T12:07:37.959Z',
    });

    expect(facesRepository.findClosestPrototypeCandidates).toHaveBeenCalledWith(
      embedding,
      [1, 2],
      10,
    );
  });

  it('falls back to class enrollment embeddings when no prototype candidate exists', async () => {
    const { service, facesRepository } = buildService({
      prototypeCandidates: [],
    });

    const response = await service.verifyAttendance({
      sessionId: 91,
      sourceDeviceId: 'pi-room-a-01',
      embedding,
      cameraId: 'CAM_01',
      trackId: 42,
      detectionScore: 0.9,
      timestamp: '2026-04-29T12:07:37.959Z',
    });

    expect(response.status).toBe('MATCH');
    expect(facesRepository.findClosestEnrollmentEmbedding).toHaveBeenCalledWith(
      embedding,
      [1, 2],
      1,
    );
  });
});
