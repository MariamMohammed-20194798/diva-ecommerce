import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

/** Resolve backend/.env whether the process cwd is repo root or backend/. */
export function resolveBackendEnvFilePaths(): string[] {
  const candidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), 'backend', '.env'),
    resolve(__dirname, '..', '..', '.env'),
  ];

  return [...new Set(candidates.filter((path) => existsSync(path)))];
}

export function resolveBackendRoot(): string {
  if (existsSync(join(process.cwd(), 'prisma', 'schema.prisma'))) {
    return process.cwd();
  }
  if (existsSync(join(process.cwd(), 'backend', 'prisma', 'schema.prisma'))) {
    return join(process.cwd(), 'backend');
  }
  return resolve(__dirname, '..', '..');
}
