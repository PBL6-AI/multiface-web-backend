import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../../common/constants';
import {
  AttendanceRecordStatus,
  AttendanceSessionStatus,
  AttendanceType,
} from '../../../common/domain/enums';
import type {
  AttendanceRepository,
  FacesRepository,
  RawAttendanceSessionEntity,
} from '../../../packages/domain';
import {
  ActiveAttendanceSessionQueryDto,
  CreateAttendanceSessionDto,
  IngestRecognitionEventDto,
  MockAttendanceSessionFeedDto,
  VerifyAttendanceRequestDto,
  VerifyAttendanceResponseDto,
} from '../dtos';
import type { AuthenticatedUser } from '../../auth/interfaces';
import { AI_PROVIDER_TOKEN } from '../../ai-integration/ai.constants';
import type { FaceAiProvider } from '../../ai-integration/interfaces/face-ai-provider.interface';
import { EdgeDevicesService } from '../../edge-devices';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    @Inject(REPOSITORY_TOKENS.ATTENDANCE)
    private readonly attendanceRepository: AttendanceRepository,
    @Inject(REPOSITORY_TOKENS.FACES)
    private readonly facesRepository: FacesRepository,
    @Inject(AI_PROVIDER_TOKEN)
    private readonly faceAiProvider: FaceAiProvider,
    private readonly edgeDevicesService: EdgeDevicesService,
  ) {}

  async createSession(
    currentUser: AuthenticatedUser,
    createAttendanceSessionDto: CreateAttendanceSessionDto,
  ) {
    const classEntity = await this.findClassOrThrow(
      createAttendanceSessionDto.classId,
    );
    this.ensureCanManageSession(currentUser, classEntity.teacherId);

    const activeSession = classEntity.attendanceSessions.find(
      (session) => session.status === AttendanceSessionStatus.ACTIVE,
    );

    if (activeSession) {
      throw new ConflictException(
        'This class already has an active attendance session',
      );
    }

    const edgeDevice = await this.edgeDevicesService.resolveForClass(
      classEntity,
      createAttendanceSessionDto.sourceDeviceId ?? null,
      createAttendanceSessionDto.cameraId ?? null,
    );

    const session = await this.attendanceRepository.createSession({
      classId: classEntity.id,
      createdById: currentUser.id,
      startTime: createAttendanceSessionDto.startTime
        ? new Date(createAttendanceSessionDto.startTime)
        : new Date(),
      attendanceType:
        createAttendanceSessionDto.attendanceType ?? AttendanceType.AUTOMATIC,
      confidenceThreshold:
        createAttendanceSessionDto.confidenceThreshold ?? null,
      sourceDeviceId: edgeDevice.deviceCode,
      cameraId: edgeDevice.cameraId,
      videoSource: createAttendanceSessionDto.videoSource ?? null,
      status: AttendanceSessionStatus.ACTIVE,
    });

    let edgeRuntimeStarted = false;
    try {
      const edgeRuntime = await this.edgeDevicesService.startAttendanceOnDevice(
        edgeDevice,
        {
          sessionId: session.id,
          sourceDeviceId: edgeDevice.deviceCode,
          cameraId: edgeDevice.cameraId,
          roomCode: edgeDevice.roomCode,
          metadata: {
            classId: classEntity.id,
            className: classEntity.className,
          },
        },
      );
      edgeRuntimeStarted = true;

      session.videoSource = edgeRuntime.streamUrl;
      const savedSession = await this.attendanceRepository.saveSession(session);

      await this.faceAiProvider.startAttendanceSession({
        sessionId: savedSession.id,
        sourceDeviceId: savedSession.sourceDeviceId,
        cameraId: savedSession.cameraId,
        videoSource: savedSession.videoSource,
        confidenceThreshold: savedSession.confidenceThreshold,
      });

      return await this.serializeSession(savedSession);
    } catch (error) {
      if (edgeRuntimeStarted) {
        try {
          await this.edgeDevicesService.stopAttendanceOnDevice(
            edgeDevice,
            session.id,
          );
        } catch (_edgeStopError) {
          // Keep the original orchestration error as the main failure.
        }
      }
      session.status = AttendanceSessionStatus.CLOSED;
      session.endTime = new Date();
      await this.attendanceRepository.saveSession(session);
      throw error;
    }
  }

  async listSessions(
    currentUser: AuthenticatedUser,
    status?: AttendanceSessionStatus,
  ) {
    const sessions = await this.attendanceRepository.listSessions();

    const visibleSessions = sessions
      .filter((session) => this.canAccessSession(currentUser, session))
      .filter((session) => (status ? session.status === status : true));

    return Promise.all(
      visibleSessions.map((session) => this.serializeSession(session)),
    );
  }

  async getActiveSession(
    currentUser: AuthenticatedUser,
    query: ActiveAttendanceSessionQueryDto = {},
  ) {
    const sessions = await this.attendanceRepository.listSessions();
    const session =
      sessions.find(
        (item) =>
          item.status === AttendanceSessionStatus.ACTIVE &&
          (query.classId ? item.classId === query.classId : true) &&
          this.canAccessSession(currentUser, item),
      ) ?? null;

    return session ? this.serializeSession(session) : null;
  }

  async getSessionById(currentUser: AuthenticatedUser, sessionId: number) {
    const session = await this.findSessionOrThrow(sessionId);
    this.ensureCanAccessSession(currentUser, session);

    return this.serializeSession(session);
  }

  async getSessionLiveSnapshot(
    currentUser: AuthenticatedUser,
    sessionId: number,
  ) {
    const session = await this.findSessionOrThrow(sessionId);
    this.ensureCanAccessSession(currentUser, session);

    const recognizedStudents = session.records
      .filter((record) => record.status === AttendanceRecordStatus.PRESENT)
      .sort(
        (left, right) => right.recordedAt.getTime() - left.recordedAt.getTime(),
      )
      .map((record) => ({
        id: record.id,
        studentId: record.studentId,
        status: record.status,
        confidenceScore: record.confidenceScore,
        recognitionEventId: record.recognitionEventId,
        recordedAt: record.recordedAt,
        fullName: record.student.fullName,
        userCode: record.student.userCode,
      }));

    const edgeStatus = session.sourceDeviceId
      ? await this.loadEdgeSnapshot(session.sourceDeviceId, session.id)
      : null;
    const aiStatus = await this.faceAiProvider.getAttendanceStatus();

    return {
      sessionId: session.id,
      status: session.status,
      totalStudents: session.classEntity.classMembers.length,
      presentCount: recognizedStudents.length,
      pendingCount:
        session.classEntity.classMembers.length - recognizedStudents.length,
      recognitionEventCount: session.recognitionEvents.length,
      unknownFaceCount: 0,
      sourceDeviceId: session.sourceDeviceId,
      cameraId: session.cameraId,
      videoSource: session.videoSource,
      edgeDeviceStatus: edgeStatus?.deviceStatus ?? null,
      edgeLastHeartbeatAt: edgeStatus?.lastHeartbeatAt ?? null,
      streamStatus: edgeStatus?.streamStatus ?? null,
      aiPipelineRunning:
        aiStatus.is_running && aiStatus.sessionId === session.id,
      aiMetrics:
        aiStatus.is_running && aiStatus.sessionId === session.id
          ? (aiStatus.metrics ?? null)
          : null,
      recentEvents: [...session.recognitionEvents]
        .sort(
          (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
        )
        .slice(0, 10)
        .map((event) => ({
          id: event.id,
          frameId: event.frameId,
          detectedStudentId: event.detectedStudentId,
          detectedStudentName: event.detectedStudent?.fullName ?? null,
          confidenceScore: event.confidenceScore,
          similarityScore: event.similarityScore,
          isRealFace: event.isRealFace,
          createdAt: event.createdAt,
        })),
      recognizedStudents,
    };
  }

  async getDashboardOverview(currentUser: AuthenticatedUser) {
    const visibleSessions = (
      await this.attendanceRepository.listSessions()
    ).filter((session) => this.canAccessSession(currentUser, session));
    const recentSessions = visibleSessions
      .slice()
      .sort(
        (left, right) => right.startTime.getTime() - left.startTime.getTime(),
      )
      .slice(0, 5);

    return {
      scope: currentUser.role,
      activeSessionCount: visibleSessions.filter(
        (session) => session.status === AttendanceSessionStatus.ACTIVE,
      ).length,
      classCount: new Set(visibleSessions.map((session) => session.classId))
        .size,
      presentRecordCount: visibleSessions.reduce(
        (total, session) =>
          total +
          session.records.filter(
            (record) => record.status === AttendanceRecordStatus.PRESENT,
          ).length,
        0,
      ),
      pendingRecordCount: visibleSessions.reduce(
        (total, session) =>
          total +
          session.records.filter(
            (record) => record.status === AttendanceRecordStatus.PENDING,
          ).length,
        0,
      ),
      recognitionEventCount: visibleSessions.reduce(
        (total, session) => total + session.recognitionEvents.length,
        0,
      ),
      recentSessions: await Promise.all(
        recentSessions.map((session) => this.serializeSession(session)),
      ),
    };
  }

  async getStudentAttendanceHistory(currentUser: AuthenticatedUser) {
    const visibleSessions = (
      await this.attendanceRepository.listSessions()
    ).filter((session) => this.canAccessSession(currentUser, session));

    return visibleSessions
      .flatMap((session) =>
        session.records
          .filter((record) => record.studentId === currentUser.id)
          .map((record) => ({
            sessionId: session.id,
            classId: session.classId,
            className: session.classEntity.className,
            status: record.status,
            confidenceScore: record.confidenceScore,
            startTime: session.startTime,
            recordedAt: record.recordedAt,
          })),
      )
      .sort(
        (left, right) => right.startTime.getTime() - left.startTime.getTime(),
      );
  }

  async closeSession(currentUser: AuthenticatedUser, sessionId: number) {
    const session = await this.findSessionOrThrow(sessionId);
    this.ensureCanManageSession(currentUser, session.classEntity.teacherId);

    if (session.status === AttendanceSessionStatus.CLOSED) {
      throw new ConflictException('Attendance session is already closed');
    }

    session.status = AttendanceSessionStatus.CLOSED;
    session.endTime = new Date();
    await this.attendanceRepository.saveSession(session);

    // Notify AI service to stop the video pipeline
    try {
      await this.faceAiProvider.stopAttendanceSession(sessionId);
      if (session.sourceDeviceId) {
        const device = await this.edgeDevicesService.findEntityByCode(
          session.sourceDeviceId,
        );
        await this.edgeDevicesService.stopAttendanceOnDevice(device, sessionId);
      }
    } catch (error) {
      console.error('Failed to stop AI pipeline:', error);
    }

    return {
      message: 'Attendance session closed successfully',
    };
  }

  async ingestRecognitionEvent(
    sessionId: number,
    ingestRecognitionEventDto: IngestRecognitionEventDto,
  ) {
    const session = await this.findSessionOrThrow(sessionId);

    if (session.status !== AttendanceSessionStatus.ACTIVE) {
      throw new ConflictException(
        'Recognition events can only be ingested for active sessions',
      );
    }

    const recognitionEvent =
      await this.attendanceRepository.createRecognitionEvent({
        sessionId,
        frameId: ingestRecognitionEventDto.frameId,
        imageFileId: ingestRecognitionEventDto.imageFileId ?? null,
        detectedStudentId: ingestRecognitionEventDto.candidateUserId ?? null,
        matchedEmbeddingId:
          ingestRecognitionEventDto.matchedEmbeddingId ?? null,
        confidenceScore: ingestRecognitionEventDto.confidenceScore ?? null,
        similarityScore: ingestRecognitionEventDto.similarityScore ?? null,
        isRealFace: ingestRecognitionEventDto.isRealFace ?? true,
        antiSpoofingScore: ingestRecognitionEventDto.antiSpoofingScore ?? null,
        boundingBox: ingestRecognitionEventDto.boundingBox ?? null,
        detectorModel: ingestRecognitionEventDto.detectorModel ?? 'unknown',
        detectorModelVersion:
          ingestRecognitionEventDto.detectorModelVersion ?? null,
        recognitionModel:
          ingestRecognitionEventDto.recognitionModel ?? 'unknown',
        recognitionModelVersion:
          ingestRecognitionEventDto.recognitionModelVersion ?? 'unknown',
        antiSpoofingModel: ingestRecognitionEventDto.antiSpoofingModel ?? null,
        antiSpoofingModelVersion:
          ingestRecognitionEventDto.antiSpoofingModelVersion ?? null,
        metadata: {
          ...(ingestRecognitionEventDto.metadata ?? {}),
          sourceDeviceId: ingestRecognitionEventDto.sourceDeviceId,
        },
      });

    const decision = await this.applyRecognitionDecision(
      session,
      recognitionEvent.id,
      ingestRecognitionEventDto,
    );

    return {
      recognitionEventId: recognitionEvent.id,
      attendanceRecordId: decision.attendanceRecordId,
      decision: decision.decision,
      reason: decision.reason,
    };
  }

  async generateMockSessionFeed(
    currentUser: AuthenticatedUser,
    sessionId: number,
    mockAttendanceSessionFeedDto: MockAttendanceSessionFeedDto,
  ) {
    const session = await this.findSessionOrThrow(sessionId);
    this.ensureCanManageSession(currentUser, session.classEntity.teacherId);

    if (session.status !== AttendanceSessionStatus.ACTIVE) {
      throw new ConflictException(
        'Mock feed can only be generated for active attendance sessions',
      );
    }

    const recognizedCount = mockAttendanceSessionFeedDto.recognizedCount ?? 5;
    const sourceDeviceId =
      mockAttendanceSessionFeedDto.sourceDeviceId ?? 'pi-main-01';

    const remainingStudents = session.classEntity.classMembers
      .filter(
        (member) =>
          !session.records.some(
            (record) => record.studentId === member.studentId,
          ),
      )
      .slice(0, recognizedCount);

    for (const [index, member] of remainingStudents.entries()) {
      await this.ingestRecognitionEvent(sessionId, {
        sourceDeviceId,
        frameId: `mock-frame-${Date.now()}-${index + 1}`,
        candidateUserId: member.studentId,
        confidenceScore: 0.88 + (index % 5) * 0.02,
        similarityScore: 0.82 + (index % 4) * 0.02,
        isRealFace: true,
        antiSpoofingScore: 0.96,
        detectorModel: 'scrfd_500m',
        detectorModelVersion: 'mock',
        recognitionModel: 'edgeface_xxs',
        recognitionModelVersion: '1',
        antiSpoofingModel: 'mock_liveness_v1',
        antiSpoofingModelVersion: '1',
        metadata: {
          source: 'mock_dashboard_feed',
          studentName: member.student.fullName,
        },
      });
    }

    return {
      message: 'Mock attendance feed generated successfully',
    };
  }

  async verifyAttendance(
    request: VerifyAttendanceRequestDto,
  ): Promise<VerifyAttendanceResponseDto> {
    const session = await this.attendanceRepository.findSessionById(
      request.sessionId,
    );

    if (!session) {
      return {
        status: 'NO_MATCH',
        message: 'Attendance session not found',
      };
    }

    if (session.status !== AttendanceSessionStatus.ACTIVE) {
      return {
        status: 'NO_MATCH',
        message: 'Attendance session is not active',
      };
    }

    if (session.cameraId && request.cameraId !== session.cameraId) {
      return {
        status: 'NO_MATCH',
        message: `Camera ${request.cameraId} is not assigned to session ${session.id}`,
      };
    }

    if (
      session.sourceDeviceId &&
      request.sourceDeviceId &&
      request.sourceDeviceId !== session.sourceDeviceId
    ) {
      return {
        status: 'NO_MATCH',
        message: `Edge device ${request.sourceDeviceId} is not assigned to session ${session.id}`,
      };
    }

    const studentIds = session.classEntity.classMembers.map(
      (member) => member.studentId,
    );
    if (studentIds.length === 0) {
      return {
        status: 'NO_MATCH',
        message: 'No students found in this attendance session',
      };
    }

    const prototypeCandidates =
      await this.facesRepository.findClosestPrototypeCandidates(
        request.embedding,
        studentIds,
        10,
      );

    this.logger.debug(
      `verifyAttendance session=${session.id} prototypes=${prototypeCandidates
        .slice(0, 3)
        .map(
          (candidate) =>
            `${candidate.studentId}:${candidate.similarity.toFixed(4)}`,
        )
        .join(', ')}`,
    );

    const candidateStudentIds = prototypeCandidates.length
      ? prototypeCandidates.map((candidate) => candidate.studentId)
      : studentIds;

    if (!prototypeCandidates.length) {
      this.logger.warn(
        `verifyAttendance session=${session.id} found no class prototype candidates; falling back to ${studentIds.length} active enrollment students`,
      );
    }

    const closestMatches =
      await this.facesRepository.findClosestEnrollmentEmbedding(
        request.embedding,
        candidateStudentIds,
        1,
      );

    if (!closestMatches.length) {
      return {
        status: 'NO_MATCH',
        message: 'No matching face embedding found',
      };
    }

    const match = closestMatches[0];
    const threshold = session.confidenceThreshold ?? 0.8;
    this.logger.debug(
      `verifyAttendance session=${session.id} bestEmbedding student=${match.studentId} embedding=${match.embeddingId} similarity=${match.similarity.toFixed(4)} threshold=${threshold}`,
    );
    if (match.similarity < threshold) {
      this.logger.log(
        `verifyAttendance NO_MATCH session=${session.id} track=${request.trackId} similarity=${match.similarity.toFixed(4)} threshold=${threshold}`,
      );
      return {
        status: 'NO_MATCH',
        similarity: match.similarity,
        message: `Similarity ${match.similarity.toFixed(4)} is below threshold ${threshold}`,
      };
    }

    // Attempt to register the attendance using the ingest event logic
    try {
      const ingestDto: IngestRecognitionEventDto = {
        sourceDeviceId:
          request.sourceDeviceId ?? session.sourceDeviceId ?? request.cameraId,
        frameId: `track-${request.trackId}-${Date.now()}`,
        candidateUserId: match.studentId,
        matchedEmbeddingId: match.embeddingId,
        confidenceScore: match.similarity,
        similarityScore: match.similarity,
        isRealFace: true,
        antiSpoofingScore: request.antiSpoofingScore ?? null,
        metadata: {
          ...(request.metadata ?? {}),
          detectionScore: request.detectionScore,
          matchThreshold: threshold,
        },
      };

      const result = await this.ingestRecognitionEvent(session.id, ingestDto);

      // Find the user name to return
      const member = session.classEntity.classMembers.find(
        (m) => m.studentId === match.studentId,
      );

      return {
        status: 'MATCH',
        userId: match.studentId,
        userName: member?.student?.fullName ?? 'Unknown',
        similarity: match.similarity,
        message: result.reason,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to record attendance';
      return {
        status: 'NO_MATCH',
        message: errorMessage,
      };
    }
  }

  private async applyRecognitionDecision(
    session: RawAttendanceSessionEntity,
    recognitionEventId: number,
    event: IngestRecognitionEventDto,
  ) {
    if (!event.isRealFace) {
      return {
        attendanceRecordId: null,
        decision: 'FAKE_FACE_REJECTED',
        reason:
          'Recognition event ignored because anti-spoofing flagged a fake face',
      };
    }

    if (event.candidateUserId == null) {
      return {
        attendanceRecordId: null,
        decision: 'NO_MATCH',
        reason:
          'Recognition event ignored because no candidate user was returned',
      };
    }

    const isMember = session.classEntity.classMembers.some(
      (member) => member.studentId === event.candidateUserId,
    );

    if (!isMember) {
      return {
        attendanceRecordId: null,
        decision: 'NOT_CLASS_MEMBER',
        reason: 'Recognized user is not a member of this class',
      };
    }

    const sessionThreshold = session.confidenceThreshold ?? 0.8;
    const confidenceScore = event.similarityScore ?? event.confidenceScore ?? 0;

    if (confidenceScore < sessionThreshold) {
      return {
        attendanceRecordId: null,
        decision: 'LOW_SIMILARITY',
        reason:
          'Recognition event confidence is below the configured session threshold',
      };
    }

    const existingRecord = await this.attendanceRepository.findAttendanceRecord(
      session.id,
      event.candidateUserId,
    );

    if (existingRecord) {
      existingRecord.status = AttendanceRecordStatus.PRESENT;
      existingRecord.confidenceScore = confidenceScore;
      existingRecord.imageFileId = event.imageFileId ?? null;
      existingRecord.recognitionEventId = recognitionEventId;
      const savedRecord =
        await this.attendanceRepository.saveAttendanceRecord(existingRecord);

      return {
        attendanceRecordId: savedRecord.id,
        decision: 'MATCH_ALREADY_PRESENT',
        reason:
          'Recognition event accepted and the existing attendance record was updated',
      };
    }

    const createdRecord =
      await this.attendanceRepository.createAttendanceRecord({
        sessionId: session.id,
        studentId: event.candidateUserId,
        status: AttendanceRecordStatus.PRESENT,
        confidenceScore,
        imageFileId: event.imageFileId ?? null,
        recognitionEventId,
      });

    return {
      attendanceRecordId: createdRecord.id,
      decision: 'MATCH_ATTENDANCE_MARKED',
      reason: 'Recognition event accepted and attendance recorded',
    };
  }

  private async serializeSession(session: RawAttendanceSessionEntity) {
    const presentCount = session.records.filter(
      (record) => record.status === AttendanceRecordStatus.PRESENT,
    ).length;

    return {
      id: session.id,
      classId: session.classId,
      className: session.classEntity.className,
      createdById: session.createdById,
      startTime: session.startTime,
      endTime: session.endTime,
      attendanceType: session.attendanceType,
      confidenceThreshold: session.confidenceThreshold,
      sourceDeviceId: session.sourceDeviceId,
      cameraId: session.cameraId,
      videoSource: session.videoSource,
      status: session.status,
      classMemberCount: session.classEntity.classMembers.length,
      recognitionEventCount: session.recognitionEvents.length,
      presentCount,
      records: session.records.map((record) => ({
        id: record.id,
        studentId: record.studentId,
        status: record.status,
        confidenceScore: record.confidenceScore,
        recognitionEventId: record.recognitionEventId,
        recordedAt: record.recordedAt,
        fullName: record.student.fullName,
        userCode: record.student.userCode,
      })),
    };
  }

  private async loadEdgeSnapshot(sourceDeviceId: string, sessionId: number) {
    let device;
    try {
      device = await this.edgeDevicesService.findEntityByCode(sourceDeviceId);
    } catch (_error) {
      return {
        deviceStatus: 'missing',
        lastHeartbeatAt: null,
        streamStatus: 'unregistered',
      };
    }
    let runtimeStatus: Record<string, unknown> | null = null;

    try {
      runtimeStatus =
        await this.edgeDevicesService.getDeviceRuntimeStatus(device);
    } catch (_error) {
      runtimeStatus = null;
    }

    return {
      deviceStatus: device.status,
      lastHeartbeatAt: device.lastHeartbeatAt,
      streamStatus:
        runtimeStatus && runtimeStatus['sessionId'] === sessionId
          ? String(runtimeStatus['status'] ?? 'running')
          : runtimeStatus
            ? 'idle'
            : 'unreachable',
    };
  }

  private canAccessSession(
    currentUser: AuthenticatedUser,
    session: RawAttendanceSessionEntity,
  ): boolean {
    if (currentUser.role === 'admin') {
      return true;
    }

    if (currentUser.role === 'teacher') {
      return session.classEntity.teacherId === currentUser.id;
    }

    return session.classEntity.classMembers.some(
      (member) => member.studentId === currentUser.id,
    );
  }

  private ensureCanAccessSession(
    currentUser: AuthenticatedUser,
    session: RawAttendanceSessionEntity,
  ) {
    if (!this.canAccessSession(currentUser, session)) {
      throw new ForbiddenException(
        'You do not have permission to access this attendance session',
      );
    }
  }

  private ensureCanManageSession(
    currentUser: AuthenticatedUser,
    teacherId: number,
  ) {
    if (
      currentUser.role !== 'admin' &&
      !(currentUser.role === 'teacher' && teacherId === currentUser.id)
    ) {
      throw new ForbiddenException(
        'You do not have permission to manage this attendance session',
      );
    }
  }

  private async findSessionOrThrow(sessionId: number) {
    const session = await this.attendanceRepository.findSessionById(sessionId);

    if (!session) {
      throw new NotFoundException('Attendance session not found');
    }

    return session;
  }

  private async findClassOrThrow(classId: number) {
    const classEntity = await this.attendanceRepository.findClassById(classId);

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    if (!classEntity.classMembers.length) {
      throw new BadRequestException(
        'Cannot create an attendance session for a class without students',
      );
    }

    return classEntity;
  }
}
