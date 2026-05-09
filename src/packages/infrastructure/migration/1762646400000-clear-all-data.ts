import { MigrationInterface, QueryRunner } from 'typeorm';

export class ClearAllData1762646400000 implements MigrationInterface {
  name = 'ClearAllData1762646400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      DECLARE
        table_list text;
      BEGIN
        SELECT string_agg(format('%I.%I', schemaname, tablename), ', ')
        INTO table_list
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename NOT IN ('migrations', 'typeorm_metadata');

        IF table_list IS NOT NULL THEN
          EXECUTE 'TRUNCATE TABLE ' || table_list || ' RESTART IDENTITY CASCADE';
        END IF;
      END
      $$;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // This migration intentionally has no down step because deleted data cannot be restored.
  }
}
