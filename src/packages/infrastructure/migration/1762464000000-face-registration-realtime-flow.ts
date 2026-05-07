import { MigrationInterface, QueryRunner } from 'typeorm';

export class FaceRegistrationRealtimeFlow1762464000000 implements MigrationInterface {
  name = 'FaceRegistrationRealtimeFlow1762464000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "face_registration_requests"
      ADD COLUMN IF NOT EXISTS "session_status" character varying(50) NOT NULL DEFAULT 'collecting'
    `);
    await queryRunner.query(`
      ALTER TABLE "face_registration_requests"
      ADD COLUMN IF NOT EXISTS "embedding_status" character varying(50) NOT NULL DEFAULT 'not_started'
    `);
    await queryRunner.query(`
      ALTER TABLE "face_registration_requests"
      ADD COLUMN IF NOT EXISTS "target_count_per_pose" integer NOT NULL DEFAULT 20
    `);
    await queryRunner.query(`
      ALTER TABLE "face_registration_requests"
      ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMP NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "face_registration_requests"
      ADD COLUMN IF NOT EXISTS "metadata" jsonb NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "face_registration_requests"
      ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP NOT NULL DEFAULT now()
    `);
    await queryRunner.query(`
      UPDATE "face_registration_requests"
      SET
        "session_status" = CASE
          WHEN "status" = 'approved' THEN 'embedding_completed'
          WHEN "status" = 'rejected' THEN 'embedding_failed'
          ELSE 'collecting'
        END,
        "embedding_status" = CASE
          WHEN "status" = 'approved' THEN 'completed'
          WHEN "status" = 'rejected' THEN 'failed'
          ELSE 'not_started'
        END,
        "updated_at" = COALESCE("reviewed_at", "created_at")
    `);
    await queryRunner.query(`
      ALTER TABLE "face_images"
      DROP CONSTRAINT IF EXISTS "UQ_face_images_request_pose"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "face_images"
      ADD CONSTRAINT "UQ_face_images_request_pose" UNIQUE ("request_id", "pose")
    `);
    await queryRunner.query(`
      ALTER TABLE "face_registration_requests"
      DROP COLUMN IF EXISTS "updated_at"
    `);
    await queryRunner.query(`
      ALTER TABLE "face_registration_requests"
      DROP COLUMN IF EXISTS "metadata"
    `);
    await queryRunner.query(`
      ALTER TABLE "face_registration_requests"
      DROP COLUMN IF EXISTS "completed_at"
    `);
    await queryRunner.query(`
      ALTER TABLE "face_registration_requests"
      DROP COLUMN IF EXISTS "target_count_per_pose"
    `);
    await queryRunner.query(`
      ALTER TABLE "face_registration_requests"
      DROP COLUMN IF EXISTS "embedding_status"
    `);
    await queryRunner.query(`
      ALTER TABLE "face_registration_requests"
      DROP COLUMN IF EXISTS "session_status"
    `);
  }
}
