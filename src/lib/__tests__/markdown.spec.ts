import { describe, expect, it } from 'vitest'
import { renderNote, renderNoteLine } from '@/lib/markdown'

describe('renderNote (K43)', () => {
  it('renders emphasis, code, lists and links, each link opening in a new tab', () => {
    expect(renderNote('**Ribs down.** Keep it *slow*, `3 s` down')).toBe(
      '<p><strong>Ribs down.</strong> Keep it <em>slow</em>, <code>3 s</code> down</p>\n',
    )
    expect(renderNote('- left\n- right')).toBe('<ul>\n<li>left</li>\n<li>right</li>\n</ul>\n')
    expect(renderNote('[Form video](https://example.com/push-ups)')).toBe(
      '<p><a href="https://example.com/push-ups" target="_blank" rel="noopener noreferrer">Form video</a></p>\n',
    )
  })

  it('turns a bare URL into a link, and keeps a line break', () => {
    expect(renderNote('See https://example.com\nthen rest')).toBe(
      '<p>See <a href="https://example.com" target="_blank" rel="noopener noreferrer">https://example.com</a><br>\nthen rest</p>\n',
    )
  })

  it('never renders raw HTML, a script link or an image', () => {
    expect(renderNote('<script>alert(1)</script>')).toBe(
      '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>\n',
    )
    expect(renderNote('<img src=x onerror=alert(1)>')).not.toContain('<img')
    expect(renderNote('[click](javascript:alert(1))')).not.toContain('<a')
    expect(renderNote('![a cat](https://example.com/cat.png)')).not.toContain('<img')
  })

  it('leaves headings and rules as text: a note is not a page', () => {
    expect(renderNote('# Big')).toBe('<p># Big</p>\n')
    expect(renderNote('---')).toBe('<p>---</p>\n')
  })
})

describe('renderNoteLine (K43)', () => {
  it('keeps inline formatting on one line, a link as its underlined text', () => {
    expect(renderNoteLine('Slow **down**.\n[Form video](https://example.com)')).toBe(
      'Slow <strong>down</strong>. <span class="note-link">Form video</span>',
    )
  })

  it('escapes raw HTML here too', () => {
    expect(renderNoteLine('<b>bold</b>')).toBe('&lt;b&gt;bold&lt;/b&gt;')
  })
})
