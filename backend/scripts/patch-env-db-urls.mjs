/**
 * Ensures Supabase/Prisma connection params exist in backend/.env
 * Run: node scripts/patch-env-db-urls.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ENV_PATH = join(process.cwd(), '.env');

function appendParams(rawLine, params) {
  const m = rawLine.match(/^([A-Z_]+)=(.*)$/);
  if (!m) return rawLine;

  const key = m[1];
  let value = m[2].trim();
  const quoted = (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"));
  if (quoted) value = value.slice(1, -1);

  const qIndex = value.indexOf('?');
  const base = qIndex === -1 ? value : value.slice(0, qIndex);
  const search = new URLSearchParams(qIndex === -1 ? '' : value.slice(qIndex + 1));

  for (const [k, v] of Object.entries(params)) {
    if (!search.has(k)) search.set(k, v);
  }

  const next = `${base}?${search.toString()}`;
  return quoted ? `${key}="${next}"` : `${key}=${next}`;
}

const pooledParams = {
  pgbouncer: 'true',
  sslmode: 'require',
  connect_timeout: '30',
  pool_timeout: '30',
};

const directParams = {
  sslmode: 'require',
  connect_timeout: '30',
};

let env = readFileSync(ENV_PATH, 'utf8');
let changed = false;

env = env
  .split('\n')
  .map((line) => {
    if (line.startsWith('DATABASE_URL=')) {
      changed = true;
      return appendParams(line, pooledParams);
    }
    if (line.startsWith('DIRECT_URL=')) {
      changed = true;
      return appendParams(line, directParams);
    }
    return line;
  })
  .join('\n');

if (changed) {
  writeFileSync(ENV_PATH, env);
  console.log('Updated DATABASE_URL and DIRECT_URL in .env');
} else {
  console.log('No DATABASE_URL/DIRECT_URL lines found in .env');
}
