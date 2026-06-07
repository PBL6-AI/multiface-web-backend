import { AttendanceSessionStatus } from '../../../common/domain/enums';
import { AttendanceService } from './attendance.service';

describe('AttendanceService similarity optimization', () => {
  const buildService = () => {
    const attendanceRepository = {
      findSessionById: jest.fn(),
      createRecognitionEvent: jest.fn(),
      findAttendanceRecord: jest.fn(),
      createAttendanceRecord: jest.fn(),
    };
    const facesRepository = {
      findClosestPrototypeCandidates: jest.fn(),
      findClosestEnrollmentEmbedding: jest.fn(),
    };

    const service = new AttendanceService(
      attendanceRepository as never,
      facesRepository as never,
      {} as never,
      {} as never,
    );

    return { service, attendanceRepository, facesRepository };
  };

  const session = {
    id: 10,
    status: AttendanceSessionStatus.ACTIVE,
    cameraId: 'CAM_01',
    sourceDeviceId: 'edge-01',
    confidenceThreshold: null,
    classEntity: {
      classMembers: [{ studentId: 101 }, { studentId: 102 }],
    },
  };

  it('matches directly against active enrollment embeddings for class members', async () => {
    const { service, attendanceRepository, facesRepository } = buildService();
    attendanceRepository.findSessionById.mockResolvedValue(session);
    facesRepository.findClosestEnrollmentEmbedding.mockResolvedValue([
      { studentId: 101, embeddingId: 7, similarity: 0.5 },
    ]);

    const response = await service.verifyAttendance({
      sessionId: 10,
      embedding: [0.1, 0.2],
      cameraId: 'CAM_01',
      sourceDeviceId: 'edge-01',
      trackId: 3,
      detectionScore: 0.99,
      timestamp: new Date().toISOString(),
    });

    expect(
      facesRepository.findClosestPrototypeCandidates,
    ).not.toHaveBeenCalled();
    expect(facesRepository.findClosestEnrollmentEmbedding).toHaveBeenCalledWith(
      [0.1, 0.2],
      [101, 102],
      1,
    );
    expect(response).toMatchObject({
      status: 'NO_MATCH',
      similarity: 0.5,
    });
  });

  it('uses similarity score before detection score for recognition decisions', async () => {
    const { service } = buildService();

    const decision = await (
      service as unknown as {
        applyRecognitionDecision: (
          session: unknown,
          recognitionEventId: number,
          event: unknown,
        ) => Promise<{ decision: string }>;
      }
    ).applyRecognitionDecision(session, 99, {
      candidateUserId: 101,
      confidenceScore: 0.99,
      similarityScore: 0.5,
      isRealFace: true,
    });

    expect(decision.decision).toBe('LOW_SIMILARITY');
  });
});
