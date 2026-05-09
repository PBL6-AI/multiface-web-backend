import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropObsoleteTables1762653600000 implements MigrationInterface {
  name = 'DropObsoleteTables1762653600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "role_permissions" CASCADE
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "permissions" CASCADE
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "notifications" CASCADE
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "appeals" CASCADE
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "leave_requests" CASCADE
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "unknown_faces" CASCADE
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "face_images" CASCADE
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "face_registration_requests" CASCADE
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // This migration intentionally has no down step because these dropped
    // tables are obsolete legacy structures and should not be recreated.
  }
}
