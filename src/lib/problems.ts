import type { AuthProblem } from '@/stores/session'
import { countOf } from '@/lib/words'

/** A sentence for each way a sign-in, a link or a sign-out can fail. */
export function describeProblem(p: AuthProblem): string {
  switch (p.code) {
    case 'invalid':
      return 'Wrong username or password. Check both and try again.'
    case 'locked': {
      const minutes = Math.max(1, Math.ceil((p.retryAfter ?? 900) / 60))
      return `Too many attempts. Try again in ${countOf(minutes, 'minute')}.`
    }
    case 'busy':
      return 'The server is busy. Try again in a moment.'
    case 'offline':
      return 'Can’t reach the server. Check the connection and try again.'
    case 'gone':
      return 'This link has expired or was already used. Ask for a new one.'
    case 'password':
      return 'Use 10 to 256 characters.'
    default:
      return 'Something went wrong. Try again.'
  }
}
