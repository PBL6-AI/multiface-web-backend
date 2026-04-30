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

const seedPassword = process.env.SEED_USER_PASSWORD ?? 'Test@123456';

const seedUsers = [
  {
    fullName: 'System Admin',
    userCode: 'ADM001',
    email: 'admin1@multiface.local',
    role: 'admin',
    phone: '0901000001',
  },
  {
    fullName: 'Platform Admin',
    userCode: 'ADM002',
    email: 'admin2@multiface.local',
    role: 'admin',
    phone: '0901000002',
  },
  {
    fullName: 'Teacher Alpha',
    userCode: 'GV001',
    email: 'teacher1@multiface.local',
    role: 'teacher',
    phone: '0902000001',
  },
  {
    fullName: 'Teacher Beta',
    userCode: 'GV002',
    email: 'teacher2@multiface.local',
    role: 'teacher',
    phone: '0902000002',
  },
  {
    fullName: 'Teacher Gamma',
    userCode: 'GV003',
    email: 'teacher3@multiface.local',
    role: 'teacher',
    phone: '0902000003',
  },
  {
    fullName: 'Student One',
    userCode: 'SV001',
    email: 'student1@multiface.local',
    role: 'student',
    phone: '0903000001',
  },
  {
    fullName: 'Student Two',
    userCode: 'SV002',
    email: 'student2@multiface.local',
    role: 'student',
    phone: '0903000002',
  },
  {
    fullName: 'Student Three',
    userCode: 'SV003',
    email: 'student3@multiface.local',
    role: 'student',
    phone: '0903000003',
  },
  {
    fullName: 'Student Four',
    userCode: 'SV004',
    email: 'student4@multiface.local',
    role: 'student',
    phone: '0903000004',
  },
  {
    fullName: 'Student Five',
    userCode: 'SV005',
    email: 'student5@multiface.local',
    role: 'student',
    phone: '0903000005',
  },
];

async function main() {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    await client.query('BEGIN');

    const roleIds = await ensureRoles(client);

    for (const user of seedUsers) {
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
          user.fullName,
          user.userCode,
          user.email,
          passwordHash,
          roleIds[user.role],
          user.phone,
        ],
      );
    }

    await client.query('COMMIT');

    console.log('Seeded test users successfully.');
    console.log(`Default password: ${seedPassword}`);

    for (const user of seedUsers) {
      console.log(
        `- ${user.role.toUpperCase()} | ${user.userCode} | ${user.email} | ${user.fullName}`,
      );
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to seed test users.');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

async function ensureRoles(client) {
  const roles = ['admin', 'teacher', 'student'];

  for (const roleName of roles) {
    await client.query(
      `
        INSERT INTO roles (name, description)
        VALUES ($1, $2)
        ON CONFLICT (name) DO UPDATE
        SET description = EXCLUDED.description
      `,
      [roleName, `${roleName} role`],
    );
  }

  const roleResult = await client.query(
    `
      SELECT id, name
      FROM roles
      WHERE name = ANY($1::varchar[])
    `,
    [roles],
  );

  return Object.fromEntries(
    roleResult.rows.map((role) => [role.name, Number(role.id)]),
  );
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
