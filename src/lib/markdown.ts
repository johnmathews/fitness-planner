import MarkdownIt from 'markdown-it'

/**
 * An item's note, in markdown (K43). Raw HTML is never rendered (it shows as the text it is), and
 * markdown-it's own link check refuses `javascript:`, `vbscript:`, `file:` and most `data:` links.
 * A note is a few lines, so it keeps emphasis, links, code, lists and quotes, and leaves out what
 * would make it a page: images, headings, tables and rules. Bare URLs become links.
 */
function notes(): MarkdownIt {
  return new MarkdownIt({ html: false, linkify: true, breaks: true }).disable([
    'image',
    'heading',
    'lheading',
    'table',
    'hr',
  ])
}

/** The whole note, for the popover: every link opens in a new tab and tells it nothing. */
const whole = notes()
whole.renderer.rules.link_open = (tokens, idx, options, _env, self) => {
  tokens[idx]!.attrSet('target', '_blank')
  tokens[idx]!.attrSet('rel', 'noopener noreferrer')
  return self.renderToken(tokens, idx, options)
}

/**
 * The note's one line in the row: inline formatting only, with its line breaks as spaces. The line
 * is a button that opens the whole note, and a link can't sit inside a button, so a link shows as
 * its underlined text here and works in the popover.
 */
const line = notes()
line.renderer.rules.link_open = () => '<span class="note-link">'
line.renderer.rules.link_close = () => '</span>'

export function renderNote(src: string): string {
  return whole.render(src)
}

export function renderNoteLine(src: string): string {
  return line.renderInline(src.replace(/\s*\n\s*/g, ' '))
}
