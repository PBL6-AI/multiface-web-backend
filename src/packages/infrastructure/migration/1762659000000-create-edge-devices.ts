import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEdgeDevices1762659000000 implements MigrationInterface {
  name = 'CreateEdgeDevices1762659000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "edge_devices" (
        "id" SERIAL PRIMARY KEY,
        "device_code" varchar(120) NOT NULL UNIQUE,
        "device_name" varchar(255) NOT NULL,
        "room_code" varchar(120) NOT NULL,
        "camera_id" varchar(120) NOT NULL,
        "control_base_url" varchar(255) NOT NULL,
        "stream_base_url" varchar(255) NOT NULL,
        "status" varchar(30) NOT NULL DEFAULT 'offline',
        "last_heartbeat_at" timestamp NULL,
        "metadata" jsonb NULL,
        "created_at" timestamp NOT NULL DEFAULT NOW(),
        "updated_at" timestamp NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_edge_devices_room_code"
      ON "edge_devices" ("room_code")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_edge_devices_status"
      ON "edge_devices" ("status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "edge_devices" CASCADE`);
  }
}
