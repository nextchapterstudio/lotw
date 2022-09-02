type LotwErrorCodes =
  | 'CONNECTOR_NOT_REGISTERED'
  | 'CONNECTOR_ERROR'
  | 'USER_REJECTED'
  | 'NO_CONNECTOR'

export class LotwError extends Error {
  public readonly cause?
  public readonly code: LotwErrorCodes

  constructor(opts: {
    code: LotwErrorCodes
    message?: string
    cause?: unknown
  }) {
    const message = opts.message ?? getErrorMessage(opts.cause, opts.code)
    const cause = getErrorFromUnknown(opts.cause)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore https://github.com/tc39/proposal-error-cause
    super(message, { cause })

    this.name = 'LotwError'
    this.code = opts.code
    this.cause = cause

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
