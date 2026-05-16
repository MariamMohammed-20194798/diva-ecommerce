export declare function isRetryablePrismaError(error: unknown): boolean;
export declare function getPooledDatabaseUrl(): string;
export declare function getDirectDatabaseUrl(): string;
export declare function sleep(ms: number): Promise<void>;
export declare function withPrismaRetry<T>(operation: () => Promise<T>, maxAttempts?: number): Promise<T>;
