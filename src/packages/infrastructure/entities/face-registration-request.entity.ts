import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApprovalStatus } from './enums';
import { FaceImageEntity } from './face-image.entity';
import { UserEntity } from './user.entity';

@Entity('face_registration_requests')
export class FaceRegistrationRequestEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  @Column({ name: 'reviewed_by', type: 'int', nullable: true })
  reviewedById: number | null;

  @Column({ name: 'reviewed_at', type: 'datetime', nullable: true })
  reviewedAt: Date | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.faceRegistrationRequests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: UserEntity;

  @ManyToOne(
    () => UserEntity,
    (user) => user.reviewedFaceRegistrationRequests,
    {
      onDelete: 'SET NULL',
      nullable: true,
    },
  )
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy: UserEntity | null;

  @OneToMany(() => FaceImageEntity, (faceImage) => faceImage.request)
  faceImages: FaceImageEntity[];
}
