import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EdgeDeviceEntity } from '../../../packages/infrastructure/entities';
import type { RawClassEntity } from '../../../packages/domain';
import { EdgeDeviceHeartbeatDto, RegisterEdgeDeviceDto } from '../dtos';

type EdgeStartPayload = {
  sessionId: number;
  sourceDeviceId: string;
  cameraId: string;
  roomCode: string;
  metadata?: Record<string, unknown> | null;
};

type EdgeStartResponse = {
  status: string;
  streamUrl: string;
  cameraId: string;
  sessionId: number;
};

type EdgePreviewResponse = {
  status: string;
  streamUrl?: string | null;
  previewUrl?: string | null;
  streamPath?: string | null;
  cameraId: string;
};

type EdgeRecordingResponse = {
  status: string;
  isRecording: boolean;
  recordingId: string;
  filePath: string;
  fileName: string;
  source: string;
  startedAt?: string | null;
};

@Injectable()
export class EdgeDevicesService {
  private readonly edgeTimeoutMs = 15000;
  private readonly recordingDownloadTimeoutMs = 60_000;
  private readonly onlineWindowMs = 90_000;

  constructor(
    @InjectRepository(EdgeDeviceEntity)
    private readonly edgeDevicesRepository: Repository<EdgeDeviceEntity>,
  ) {}

  async register(payload: RegisterEdgeDeviceDto) {
    const existing = await this.edgeDevicesRepository.findOne({
      where: { deviceCode: payload.deviceCode },
    });

    const saved = await this.edgeDevicesRepository.save(
      this.edgeDevicesRepository.create({
        ...existing,
        ...payload,
        status: existing?.status ?? 'offline',
        lastHeartbeatAt: existing?.lastHeartbeatAt ?? null,
        metadata: payload.metadata ?? existing?.metadata ?? null,
      }),
    );

    return this.serialize(saved);
  }

  async heartbeat(payload: EdgeDeviceHeartbeatDto) {
    const device = await this.edgeDevicesRepository.findOne({
      where: { deviceCode: payload.deviceCode },
    });

    if (!device) {
      throw new NotFoundException('Edge device not found');
    }

    device.status = payload.status;
    device.lastHeartbeatAt = new Date();
    device.metadata = {
      ...(device.metadata ?? {}),
      ...(payload.metadata ?? {}),
      activeSessionId: payload.activeSessionId ?? null,
      streamUrl: payload.streamUrl ?? null,
    };

    const saved = await this.edgeDevicesRepository.save(device);
    return this.serialize(saved);
  }

  async list() {
    const devices = await this.edgeDevicesRepository.find({
      order: {
        roomCode: 'ASC',
        deviceCode: 'ASC',
      },
    });
    return devices.map((device) => this.serialize(device));
  }

  async getByCode(deviceCode: string) {
    const device = await this.edgeDevicesRepository.findOne({
      where: { deviceCode },
    });

    if (!device) {
      throw new NotFoundException('Edge device not found');
    }

    return this.serialize(device);
  }

  async listEnrollmentDevices() {
    const devices = await this.edgeDevicesRepository.find({
      order: {
        roomCode: 'ASC',
        deviceCode: 'ASC',
      },
    });

    return devices.map((device) => ({
      deviceCode: device.deviceCode,
      deviceName: device.deviceName,
      roomCode: device.roomCode,
      cameraId: device.cameraId,
      status: this.isRecentlyOnline(device) ? 'online' : device.status,
    }));
  }

  async findEntityByCode(deviceCode: string) {
    const device = await this.edgeDevicesRepository.findOne({
      where: { deviceCode },
    });

    if (!device) {
      throw new NotFoundException('Edge device not found');
    }

    return device;
  }

  async resolveForClass(
    classEntity: RawClassEntity,
    requestedSourceDeviceId?: string | null,
    requestedCameraId?: string | null,
  ): Promise<EdgeDeviceEntity> {
    if (requestedSourceDeviceId) {
      const device = await this.findEntityByCode(requestedSourceDeviceId);
      this.ensureOnline(device);

      if (requestedCameraId && device.cameraId !== requestedCameraId) {
        throw new BadRequestException(
          `Edge device ${requestedSourceDeviceId} is bound to camera ${device.cameraId}, not ${requestedCameraId}`,
        );
      }

      return device;
    }

    const distinctRooms = Array.from(
      new Set(
        classEntity.schedules
          .map((schedule) => schedule.room?.trim())
          .filter((room): room is string => Boolean(room)),
      ),
    );

    if (distinctRooms.length !== 1) {
      throw new BadRequestException(
        'Unable to auto-bind edge device because this class does not map to exactly one room',
      );
    }

    const candidates = await this.edgeDevicesRepository.find({
      where: {
        roomCode: distinctRooms[0],
      },
      order: {
        updatedAt: 'DESC',
      },
    });

    const onlineCandidates = candidates.filter((candidate) =>
      this.isRecentlyOnline(candidate),
    );

    if (onlineCandidates.length !== 1) {
      throw new BadRequestException(
        `Unable to auto-bind edge device for room ${distinctRooms[0]}. Please select a device explicitly.`,
      );
    }

    return onlineCandidates[0];
  }

  async resolveForEnrollment(
    requestedSourceDeviceId?: string | null,
  ): Promise<EdgeDeviceEntity> {
    if (requestedSourceDeviceId) {
      const device = await this.findEntityByCode(requestedSourceDeviceId);
      this.ensureOnline(device);
      return device;
    }

    const devices = await this.edgeDevicesRepository.find({
      order: {
        updatedAt: 'DESC',
      },
    });
    const onlineDevices = devices.filter((device) =>
      this.isRecentlyOnline(device),
    );

    if (onlineDevices.length !== 1) {
      throw new BadRequestException(
        'Unable to auto-select an edge device. Please select one online Arducam device.',
      );
    }

    return onlineDevices[0];
  }

  async startAttendanceOnDevice(
    device: EdgeDeviceEntity,
    payload: EdgeStartPayload,
  ): Promise<EdgeStartResponse> {
    const response = await this.post<EdgeStartResponse>(
      device.controlBaseUrl,
      '/attendance/start',
      payload,
    );

    return response;
  }

  async stopAttendanceOnDevice(device: EdgeDeviceEntity, sessionId: number) {
    return this.post<Record<string, unknown>>(
      device.controlBaseUrl,
      '/attendance/stop',
      { sessionId },
    );
  }

  async startEnrollmentPreviewOnDevice(
    device: EdgeDeviceEntity,
  ): Promise<EdgePreviewResponse> {
    return this.post<EdgePreviewResponse>(
      device.controlBaseUrl,
      '/preview/start',
      {
        streamPath: `${device.deviceCode}/enrollment-preview`,
      },
    );
  }

  async stopEnrollmentPreviewOnDevice(device: EdgeDeviceEntity) {
    return this.post<Record<string, unknown>>(
      device.controlBaseUrl,
      '/preview/stop',
      {},
    );
  }

  async startEnrollmentRecordingOnDevice(
    device: EdgeDeviceEntity,
    recordingId: string,
    fileName: string,
  ): Promise<EdgeRecordingResponse> {
    return this.post<EdgeRecordingResponse>(
      device.controlBaseUrl,
      '/recording/start',
      { recordingId, fileName },
    );
  }

  async stopEnrollmentRecordingOnDevice(
    device: EdgeDeviceEntity,
    recordingId: string,
  ): Promise<EdgeRecordingResponse> {
    return this.post<EdgeRecordingResponse>(
      device.controlBaseUrl,
      '/recording/end',
      { recordingId },
    );
  }

  async downloadRecordingFromDevice(
    device: EdgeDeviceEntity,
    fileName: string,
  ): Promise<Buffer> {
    const abortController = new AbortController();
    const timeout = setTimeout(
      () => abortController.abort(),
      this.recordingDownloadTimeoutMs,
    );

    try {
      const response = await fetch(
        `${device.controlBaseUrl}/recording/files/${encodeURIComponent(fileName)}`,
        {
          method: 'GET',
          signal: abortController.signal,
        },
      );

      if (!response.ok) {
        const body = await response.text();
        throw new BadRequestException(
          body || `Recording download failed with status ${response.status}`,
        );
      }

      return Buffer.from(await response.arrayBuffer());
    } finally {
      clearTimeout(timeout);
    }
  }

  async getDeviceRuntimeStatus(device: EdgeDeviceEntity) {
    const abortController = new AbortController();
    const timeout = setTimeout(
      () => abortController.abort(),
      this.edgeTimeoutMs,
    );

    try {
      const response = await fetch(
        `${device.controlBaseUrl}/attendance/status`,
        {
          method: 'GET',
          signal: abortController.signal,
        },
      );

      if (!response.ok) {
        throw new Error(
          `Edge device status request failed with ${response.status}`,
        );
      }

      return (await response.json()) as Record<string, unknown>;
    } finally {
      clearTimeout(timeout);
    }
  }

  private ensureOnline(device: EdgeDeviceEntity) {
    if (!this.isRecentlyOnline(device)) {
      throw new BadRequestException(
        `Edge device ${device.deviceCode} is offline or heartbeat is stale`,
      );
    }
  }

  private isRecentlyOnline(device: EdgeDeviceEntity) {
    if (
      !['online', 'running', 'recording', 'previewing'].includes(device.status)
    ) {
      return false;
    }

    if (!device.lastHeartbeatAt) {
      return false;
    }

    return (
      Date.now() - new Date(device.lastHeartbeatAt).getTime() <=
      this.onlineWindowMs
    );
  }

  private async post<TResponse>(
    baseUrl: string,
    path: string,
    payload: unknown,
  ): Promise<TResponse> {
    const abortController = new AbortController();
    const timeout = setTimeout(
      () => abortController.abort(),
      this.edgeTimeoutMs,
    );

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new BadRequestException(
          body || `Edge device request failed with status ${response.status}`,
        );
      }

      return (await response.json()) as TResponse;
    } finally {
      clearTimeout(timeout);
    }
  }

  private serialize(device: EdgeDeviceEntity) {
    return {
      id: device.id,
      deviceCode: device.deviceCode,
      deviceName: device.deviceName,
      roomCode: device.roomCode,
      cameraId: device.cameraId,
      controlBaseUrl: device.controlBaseUrl,
      streamBaseUrl: device.streamBaseUrl,
      status: device.status,
      lastHeartbeatAt: device.lastHeartbeatAt,
      metadata: device.metadata ?? null,
    };
  }
}
