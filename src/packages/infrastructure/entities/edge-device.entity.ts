import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('edge_devices')
@Index('IDX_edge_devices_device_code', ['deviceCode'], { unique: true })
@Index('IDX_edge_devices_room_code', ['roomCode'])
@Index('IDX_edge_devices_status', ['status'])
export class EdgeDeviceEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'device_code', type: 'varchar', length: 120, unique: true })
  deviceCode: string;

  @Column({ name: 'device_name', type: 'varchar', length: 255 })
  deviceName: string;

  @Column({ name: 'room_code', type: 'varchar', length: 120 })
  roomCode: string;

  @Column({ name: 'camera_id', type: 'varchar', length: 120 })
  cameraId: string;

  @Column({ name: 'control_base_url', type: 'varchar', length: 255 })
  controlBaseUrl: string;

  @Column({ name: 'stream_base_url', type: 'varchar', length: 255 })
  streamBaseUrl: string;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 30,
    default: 'offline',
  })
  status: string;

  @Column({ name: 'last_heartbeat_at', type: 'timestamp', nullable: true })
  lastHeartbeatAt: Date | null;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
