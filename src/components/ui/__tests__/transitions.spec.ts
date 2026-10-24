import { describe, expect, it } from 'vitest'

// The focus ring must appear at full strength at once. `transition-[color,background-color,border-color]` (and `transition-all`)
// also animate outline-color, which fades the ring in, so the primitives name what they animate.
const sources = import.meta.glob(['../*/*.{ts,vue}', '!../__tests__/**'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

describe('primitive transitions', () => {
  it('finds the primitives', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(10)
  })

  it.each(Object.entries(sources))('%s never animates the outline', (_, source) => {
    expect(source).not.toMatch(/transition-(colors|all)\b/)
  })
})
