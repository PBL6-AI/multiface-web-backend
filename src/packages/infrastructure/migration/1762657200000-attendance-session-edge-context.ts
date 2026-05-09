import { MigrationInterface, QueryRunner } from 'typeorm';

export class AttendanceSessionEdgeContext1762657200000 implements MigrationInterface {
  name = 'AttendanceSessionEdgeContext1762657200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "attendance_sessions"
      ADD COLUMN IF NOT EXISTS "source_device_id" varchar(120)
    `);

    await queryRunner.query(`
      ALTER TABLE "attendance_sessions"
      ADD COLUMN IF NOT EXISTS "camera_id" varchar(120)
    `);

    await queryRunner.query(`
      ALTER TABLE "attendance_sessions"
      ADD COLUMN IF NOT EXISTS "video_source" varchar(255)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "attendance_sessions"
      DROP COLUMN IF EXISTS "video_source"
    `);

    await queryRunner.query(`
      ALTER TABLE "attendance_sessions"
      DROP COLUMN IF EXISTS "camera_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "attendance_sessions"
      DROP COLUMN IF EXISTS "source_device_id"
    `);
  }
}
