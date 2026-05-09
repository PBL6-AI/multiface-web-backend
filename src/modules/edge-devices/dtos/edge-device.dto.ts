import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class RegisterEdgeDeviceDto {
  @ApiProperty({ example: 'pi-room-a-01' })
  @IsString()
  deviceCode: string;

  @ApiProperty({ example: 'Raspberry Pi Room A' })
  @IsString()
  deviceName: string;

  @ApiProperty({ example: 'A101' })
  @IsString()
  roomCode: string;

  @ApiProperty({ example: 'cam-imx519-01' })
  @IsString()
  cameraId: string;

  @ApiProperty({ example: 'http://192.168.1.50:5000' })
  @IsUrl({ require_tld: false, require_protocol: true })
  controlBaseUrl: string;

  @ApiProperty({ example: 'rtsp://192.168.1.50:8554' })
  @IsUrl({ require_tld: false, require_protocol: true })
  streamBaseUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class EdgeDeviceHeartbeatDto {
  @ApiProperty({ example: 'pi-room-a-01' })
  @IsString()
  deviceCode: string;

  @ApiProperty({ example: 'online' })
  @IsString()
  status: string;

  @ApiPropertyOptional({ example: 91 })
  @IsOptional()
  @IsNumber()
  activeSessionId?: number | null;

  @ApiPropertyOptional({ example: 'rtsp://192.168.1.50:8554/live' })
  @IsOptional()
  @IsString()
  streamUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class EdgeDeviceResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  deviceCode: string;

  @ApiProperty()
  deviceName: string;

  @ApiProperty()
  roomCode: string;

  @ApiProperty()
  cameraId: string;

  @ApiProperty()
  controlBaseUrl: string;

  @ApiProperty()
  streamBaseUrl: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional({ nullable: true })
  lastHeartbeatAt: Date | null;

  @ApiPropertyOptional({ nullable: true })
  metadata: Record<string, unknown> | null;
}
