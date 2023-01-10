type LotwErrorCode =
  | 'CONNECTOR_NOT_REGISTERED'
  | 'CONNECTOR_ERROR'
  | 'USER_REJECTED'

export class LotwError extends Error {
  public readonly code: LotwErrorCode

  constructor(opts: {
    code: LotwErrorCode
    message?: string
    cause?: unknown
  }) {
    const message = opts.message ?? getErrorMessage(opts.cause, opts.code)
    const cause = getErrorFromUnknown(opts.cause)

    super(`${message}\n\nCaused by: ${cause}`)

    this.name = 'LotwError'
    this.code = opts.code

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export function isLotwError(error: unknown): error is LotwError {
  return error instanceof LotwError
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error && typeof error.message === 'string') {
    return error.message
  }

  return fallback
}

function getErrorFromUnknown(error: unknown) {
  if (error instanceof Error) {
    return error
  }

  return new Error(getErrorMessage(error, 'Unknown Error'))
}
