import { MigrationInterface, QueryRunner } from 'typeorm';

export class VideoEnrollmentFlow1762550400000 implements MigrationInterface {
  name = 'VideoEnrollmentFlow1762550400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "enrollment_sessions" (
        "id" SERIAL NOT NULL,
        "student_id" integer NOT NULL,
        "video_object_key" character varying(500) NOT NULL,
        "video_filename" character varying(255) NOT NULL,
        "video_mime_type" character varying(150) NOT NULL,
        "video_size" integer NULL,
        "status" character varying(50) NOT NULL DEFAULT 'created',
        "failure_reason" text NULL,
        "job_id" character varying(255) NULL,
        "processing_started_at" TIMESTAMP NULL,
        "processing_completed_at" TIMESTAMP NULL,
        "embedding_count" integer NOT NULL DEFAULT 0,
        "prototype_ready" boolean NOT NULL DEFAULT false,
        "processing_summary" jsonb NULL,
        "metadata" jsonb NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_enrollment_sessions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_enrollment_sessions_student" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_enrollment_sessions_student_created"
      ON "enrollment_sessions" ("student_id", "created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_enrollment_sessions_status_created"
      ON "enrollment_sessions" ("status", "created_at")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "prototype_embeddings" (
        "student_id" integer NOT NULL,
        "embedding" vector(512) NOT NULL,
        "model_name" character varying(120) NOT NULL DEFAULT 'edgeface_xxs',
        "model_version" character varying(60) NOT NULL DEFAULT '1',
        "metadata" jsonb NULL,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_prototype_embeddings_student" PRIMARY KEY ("student_id"),
        CONSTRAINT "FK_prototype_embeddings_student" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "face_embeddings"
      ALTER COLUMN "face_image_id" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "face_embeddings"
      ADD COLUMN IF NOT EXISTS "enrollment_session_id" integer NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "face_embeddings"
      ADD COLUMN IF NOT EXISTS "quality_score" double precision NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "face_embeddings"
      ADD COLUMN IF NOT EXISTS "yaw" double precision NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "face_embeddings"
      ADD COLUMN IF NOT EXISTS "pitch" double precision NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "face_embeddings"
      ADD COLUMN IF NOT EXISTS "roll" double precision NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "face_embeddings"
      ADD CONSTRAINT "FK_face_embeddings_enrollment_session"
      FOREIGN KEY ("enrollment_session_id") REFERENCES "enrollment_sessions"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "face_embeddings"
      DROP CONSTRAINT IF EXISTS "FK_face_embeddings_enrollment_session"
    `);
    await queryRunner.query(`
      ALTER TABLE "face_embeddings"
      DROP COLUMN IF EXISTS "roll"
    `);
    await queryRunner.query(`
      ALTER TABLE "face_embeddings"
      DROP COLUMN IF EXISTS "pitch"
    `);
    await queryRunner.query(`
      ALTER TABLE "face_embeddings"
      DROP COLUMN IF EXISTS "yaw"
    `);
    await queryRunner.query(`
      ALTER TABLE "face_embeddings"
      DROP COLUMN IF EXISTS "quality_score"
    `);
    await queryRunner.query(`
      ALTER TABLE "face_embeddings"
      DROP COLUMN IF EXISTS "enrollment_session_id"
    `);
    await queryRunner.query(`
      DROP TABLE IF EXISTS "prototype_embeddings"
    `);
    await queryRunner.query(`
      DROP TABLE IF EXISTS "enrollment_sessions"
    `);
  }
}
