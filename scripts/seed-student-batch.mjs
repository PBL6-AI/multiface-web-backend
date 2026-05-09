import { existsSync, readFileSync } from 'node:fs';
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;
const scrypt = promisify(scryptCallback);
const SALT_BYTES = 16;
const KEY_LENGTH = 64;
const repoRoot = process.cwd();
const env = loadEnvFile(path.join(repoRoot, '.env'));

const dbConfig = {
  host: process.env.DB_HOST ?? env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? env.DB_PORT ?? 5432),
  user: process.env.DB_USERNAME ?? env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? env.DB_NAME ?? 'multiface',
};

const useSsl = (process.env.DB_SSL ?? env.DB_SSL) === 'true';
if (useSsl) {
  dbConfig.ssl = { rejectUnauthorized: false };
}

const seedPassword = process.env.SEED_STUDENT_PASSWORD ?? 'nobita123@';
const startUserCode = Number(process.env.SEED_STUDENT_START_CODE ?? 102230190);
const seedCount = Number(process.env.SEED_STUDENT_COUNT ?? 10);

function buildSeedStudents() {
  return Array.from({ length: seedCount }, (_, index) => {
    const userCode = String(startUserCode + index);
    return {
      fullName: `Student ${userCode}`,
      userCode,
      email: `${userCode}@multiface.local`,
      phone: null,
    };
  });
}

async function main() {
  const client = new Client(dbConfig);
  const seedStudents = buildSeedStudents();

  try {
    await client.connect();
    await client.query('BEGIN');

    const studentRoleId = await ensureStudentRole(client);

    for (const student of seedStudents) {
      const passwordHash = await hashSecret(seedPassword);

      await client.query(
        `
          INSERT INTO users (
            full_name,
            user_code,
            email,
            password_hash,
            role_id,
            phone,
            department_id,
            specialization_id,
            avatar_file_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, NULL, NULL, NULL)
          ON CONFLICT (user_code) DO UPDATE
          SET
            full_name = EXCLUDED.full_name,
            email = EXCLUDED.email,
            password_hash = EXCLUDED.password_hash,
            role_id = EXCLUDED.role_id,
            phone = EXCLUDED.phone,
            department_id = EXCLUDED.department_id,
            specialization_id = EXCLUDED.specialization_id,
            avatar_file_id = EXCLUDED.avatar_file_id,
            updated_at = NOW()
        `,
        [
          student.fullName,
          student.userCode,
          student.email,
          passwordHash,
          studentRoleId,
          student.phone,
        ],
      );
    }

    await client.query('COMMIT');

    console.log('Seeded student batch successfully.');
    console.log(`Start user code : ${startUserCode}`);
    console.log(`Student count   : ${seedCount}`);
    console.log(`Default password: ${seedPassword}`);

    for (const student of seedStudents) {
      console.log(
        `- STUDENT | ${student.userCode} | ${student.email} | ${student.fullName}`,
      );
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to seed student batch.');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

async function ensureStudentRole(client) {
  await client.query(
    `
      INSERT INTO roles (name, description)
      VALUES ('student', 'student role')
      ON CONFLICT (name) DO UPDATE
      SET description = EXCLUDED.description
    `,
  );

  const roleResult = await client.query(
    `
      SELECT id
      FROM roles
      WHERE name = 'student'
      LIMIT 1
    `,
  );

  if (!roleResult.rows.length) {
    throw new Error('Student role could not be created or found');
  }

  return Number(roleResult.rows[0].id);
}

async function hashSecret(value) {
  const salt = randomBytes(SALT_BYTES).toString('hex');
  const derivedKey = await scrypt(value, salt, KEY_LENGTH);

  return `${salt}:${derivedKey.toString('hex')}`;
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const separatorIndex = line.indexOf('=');

        if (separatorIndex === -1) {
          return [line, ''];
        }

        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim();
        return [key, value];
      }),
  );
}

void main();
