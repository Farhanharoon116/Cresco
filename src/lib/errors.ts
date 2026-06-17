export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'UNKNOWN_ERROR',
    public readonly statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class AuthError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401)
    this.name = 'AuthError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, public readonly details?: string) {
    super(message, 'DATABASE_ERROR', 500)
    this.name = 'DatabaseError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

export class AIProviderError extends AppError {
  constructor(
    message: string,
    public readonly provider: string = 'unknown',
    public readonly isRateLimit: boolean = false
  ) {
    super(message, 'AI_PROVIDER_ERROR', isRateLimit ? 429 : 500)
    this.name = 'AIProviderError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

/** Convert Supabase errors to DatabaseError */
export function handleSupabaseError(error: { message: string; code?: string; details?: string }): never {
  console.error('[Supabase Error]', error)
  throw new DatabaseError(error.message, error.details)
}

/** Convert any error to a safe action error object */
export function toActionError(err: unknown): { error: string; code: string } {
  console.error('[Action Error]', err)
  if (err instanceof AppError) return { error: err.message, code: err.code }
  if (err instanceof Error) return { error: err.message, code: 'UNKNOWN_ERROR' }
  return { error: 'Something went wrong. Please try again.', code: 'UNKNOWN_ERROR' }
}
