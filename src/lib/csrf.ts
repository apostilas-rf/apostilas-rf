import crypto from 'crypto'

export function generateCSRFState(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function verifyCSRFState(storedState: string, providedState: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(storedState),
    Buffer.from(providedState)
  )
}
