import { describe, expect, it } from 'vitest'
import { describeProblem } from '@/lib/problems'

describe('describeProblem', () => {
  it.each([
    [{ code: 'invalid' }, 'Wrong email, username or password. Check them and try again.'],
    [{ code: 'locked', retryAfter: 900 }, 'Too many attempts. Try again in 15 minutes.'],
    [{ code: 'locked' }, 'Too many attempts. Try again in 15 minutes.'],
    [{ code: 'locked', retryAfter: 61 }, 'Too many attempts. Try again in two minutes.'],
    [{ code: 'locked', retryAfter: 1 }, 'Too many attempts. Try again in one minute.'],
    [{ code: 'busy' }, 'The server is busy. Try again in a moment.'],
    [{ code: 'offline' }, 'Can’t reach the server. Check the connection and try again.'],
    [{ code: 'gone' }, 'This link has expired or was already used. Ask for a new one.'],
    [{ code: 'password' }, 'Use 10 to 256 characters.'],
    [{ code: 'error' }, 'Something went wrong. Try again.'],
  ] as const)('%j', (problem, text) => {
    expect(describeProblem(problem)).toBe(text)
  })
})
