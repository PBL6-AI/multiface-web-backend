import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AppealEntity } from './appeal.entity';
import { AttendanceRecordEntity } from './attendance-record.entity';
import { FaceImageEntity } from './face-image.entity';
import { LeaveRequestEntity } from './leave-request.entity';
import { RecognitionEventEntity } from './recognition-event.entity';
import { UnknownFaceEntity } from './unknown-face.entity';
import { UserEntity } from './user.entity';

@Entity('files')
@Index('IDX_files_uploader_category_created', ['uploaderId', 'category', 'createdAt'])
export class FileEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'uploader_id', type: 'int' })
  uploaderId: number;

  @Column({ name: 'file_key', type: 'varchar', length: 500 })
  fileKey: string;

  @Column({ name: 'filename', type: 'varchar', length: 255 })
  filename: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 150 })
  mimeType: string;

  @Column({ name: 'size', type: 'int' })
  size: number;

  @Column({ name: 'category', type: 'varchar', length: 100 })
  category: string;

  @Column({
    name: 'storage_provider',
    type: 'varchar',
    length: 50,
    default: 'local',
  })
  storageProvider: string;

  @Column({ name: 'checksum', type: 'varchar', length: 255, nullable: true })
  checksum: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.uploadedFiles, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'uploader_id' })
  uploader: UserEntity;

  @OneToMany(() => UserEntity, (user) => user.avatarFile)
  avatarUsers: UserEntity[];

  @OneToMany(() => FaceImageEntity, (faceImage) => faceImage.file)
  faceImages: FaceImageEntity[];

  @OneToMany(() => FaceImageEntity, (faceImage) => faceImage.alignedFile)
  alignedFaceImages: FaceImageEntity[];

  @OneToMany(
    () => AttendanceRecordEntity,
    (attendanceRecord) => attendanceRecord.imageFile,
  )
  attendanceRecords: AttendanceRecordEntity[];

  @OneToMany(
    () => RecognitionEventEntity,
    (recognitionEvent) => recognitionEvent.imageFile,
  )
  recognitionEvents: RecognitionEventEntity[];

  @OneToMany(() => UnknownFaceEntity, (unknownFace) => unknownFace.imageFile)
  unknownFaces: UnknownFaceEntity[];

  @OneToMany(
    () => LeaveRequestEntity,
    (leaveRequest) => leaveRequest.evidenceFile,
  )
  leaveRequestEvidence: LeaveRequestEntity[];

  @OneToMany(() => AppealEntity, (appeal) => appeal.evidenceFile)
  appealEvidence: AppealEntity[];
}

