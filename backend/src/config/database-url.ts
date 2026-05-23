const RETRYABLE_PRISMA_CODES = new Set(['P1001', 'P1017', 'P2024']);

export function isRetryablePrismaError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string' &&
    RETRYABLE_PRISMA_CODES.has((error as { code: string }).code)
  );
}

function stripEnvQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function appendQueryParams(
  rawUrl: string,
  params: Record<string, string>,
): string {
  const url = stripEnvQuotes(rawUrl);
  const qIndex = url.indexOf('?');
  const base = qIndex === -1 ? url : url.slice(0, qIndex);
  const search = new URLSearchParams(
    qIndex === -1 ? '' : url.slice(qIndex + 1),
  );

  for (const [key, value] of Object.entries(params)) {
    if (!search.has(key)) {
      search.set(key, value);
    }
  }

  const query = search.toString();
  return query ? `${base}?${query}` : base;
}

/** Pooled Supavisor URL (port 6543) for Prisma Client runtime queries. */
export function getPooledDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error(
      'DATABASE_URL is not set. Add it to backend/.env (see Supabase → Project Settings → Database).',
    );
  }

  const isPooled = raw.includes(':6543/') || raw.includes('pgbouncer=true');

  return appendQueryParams(raw, {
    ...(isPooled ? { pgbouncer: 'true' } : {}),
    sslmode: 'require',
    connect_timeout: '30',
    pool_timeout: '30',
    connection_limit:
      process.env.PRISMA_CONNECTION_LIMIT ??
      (process.env.NODE_ENV === 'production' ? '1' : '5'),
  });
}

/** Direct URL (port 5432) for Prisma CLI / migrations. */
export function getDirectDatabaseUrl(): string {
  const raw = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!raw) {
    throw new Error('DIRECT_URL or DATABASE_URL must be set in backend/.env');
  }

  return appendQueryParams(raw, {
    sslmode: 'require',
    connect_timeout: '30',
  });
}

export async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withPrismaRetry<T>(
  operation: () => Promise<T>,
  maxAttempts = 4,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isRetryablePrismaError(error) || attempt === maxAttempts) {
        throw error;
      }
      await sleep(500 * 2 ** (attempt - 1));
    }
  }

  throw lastError;
}
